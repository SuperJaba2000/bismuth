import logger from '../util/logger.js';
import ffmpeg from 'fluent-ffmpeg';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { copyFileSync, existsSync, mkdirSync, chmodSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export default class AudioDecoder {
    ffmpegPath = null;

    async init() {
        this.ffmpegPath = await this.getFfmpegPath();

        ffmpeg.setFfmpegPath(this.ffmpegPath);

        logger.info(`AudioDecoder initialized. FFmpeg path: ${this.ffmpegPath}`);
    }

    async getFfmpegPath() {
        try {
            return await this.findSystemFfmpegPath();
        } catch {
            try {
                return await this.getBundledFfmpegPath();
            } catch {
                throw new Error('Failed to find the system-installed embedded ffmpeg binary file!');
            }
        }

        // old separated build system

        // if (__FFMPEG_BUILD_TYPE__ === 'bundled') {
        //     logger.info('Using bundled FFmpeg');
        //     return this.getBundledFfmpegPath();
        // }

        // if (__FFMPEG_BUILD_TYPE__ === 'system') {
        //     logger.info('Using system FFmpeg');
        //     return this.findSystemFfmpegPath();
        // }
    }

    async getBundledFfmpegPath() {
        const { default: ffmpegPath } = await import('ffmpeg-static');

        if (!ffmpegPath) {
            throw new Error('Bundled ffmpeg not found. Please install ffmpeg-static.');
        }

        const tmpDir = join(tmpdir(), 'bismuth');
        const targetPath = join(tmpDir, 'ffmpeg' + (process.platform === 'win32' ? '.exe' : ''));

        if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

        if (!existsSync(targetPath)) {
            copyFileSync(ffmpegPath, targetPath);
            logger.info(`Bundled ffmpeg copied to temp dir: ${targetPath}`);
        }

        if (process.platform !== 'win32') {
            chmodSync(targetPath, 0o755);
        }

        logger.info(`Using bundled ffmpeg: ${targetPath}`);

        return targetPath;
    }

    async findSystemFfmpegPath() {
        const finderCMD = process.platform === 'win32'
            ? 'where'
            : 'which';

        try {
            const { stdout } = await execFileAsync(finderCMD, ['ffmpeg']);
            const ffmpegPath = stdout.trim().split(/\r?\n/)[0];

            if (!ffmpegPath) {
                throw new Error('FFmpeg path is empty');
            }

            return ffmpegPath;
        } catch {
            throw new Error('System FFmpeg not found. Install FFmpeg and add it to PATH.');
        }
    }

    async decode(path, options = {}) {
        if (!this.ffmpegPath) {
            throw new Error('AudioDecoder is not initialized!');
        }

        //show_message('Decoding file...', 0);

        const chunks = [];

        const ctx = options.audioContext || null;

        if (!ctx) {
            throw new Error('AudioContext is required in options');
        }

        const freq = options.freq || 44100;
        const channels = options.channels || 2;
        //const bitDepth = options.bitDepth || 16;
        const bitDepth = 16; // Fixed bit depth for PCM 16-bit output
        const bytesPerSample = bitDepth / 8;

        const codec = options.codec || 'pcm_s16le';
        const format = options.format || 's16le';

        return new Promise((resolve, reject) => {
            ffmpeg(path)
                .audioCodec(codec)
                .audioFrequency(freq)
                .audioChannels(channels)
                .format(format)
                .on('error', (err) => {
                    logger.error('Decoding failed!', err);
                    reject(err);
                })
                .pipe()
                .on('data', (chunk) => {
                    chunks.push(chunk);
                })
                .on('end', () => {
                    try {
                        const pcmData = Buffer.concat(chunks);

                        const frameSize = channels * bytesPerSample;

                        if (pcmData.length % frameSize !== 0) {
                            throw new Error('Invalid PCM data length');
                        }

                        const numSamples = pcmData.length / frameSize;

                        const audioBuffer = ctx.createBuffer(
                            channels,
                            numSamples,
                            freq,
                        );

                        const dataView = new DataView(
                            pcmData.buffer,
                            pcmData.byteOffset,
                            pcmData.byteLength,
                        );

                        for (let channel = 0; channel < channels; channel++) {
                            const channelData = audioBuffer.getChannelData(channel);
                            for (let i = 0; i < numSamples; i++) {
                                const byteOffset = (i * channels + channel) * bytesPerSample;

                                const int16Value = dataView.getInt16(byteOffset, true);
                                channelData[i] = Math.max(-1.0, int16Value / 32768.0);
                            }
                        }

                        resolve(audioBuffer);
                    } catch (err) {
                        logger.error('PCM processing failed!', err);
                        reject(err);
                    }
                });
        });
    }
}