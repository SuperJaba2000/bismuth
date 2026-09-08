import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from './ffmpeg-path.js';
import { audioContext } from './audio-system.js';
import logger from '../util/logger.js';

ffmpeg.setFfmpegPath(ffmpegPath);

// TODO : move to config
const CODEC = 'pcm_s16le';
const FORMAT = 's16le';


export async function decode(path, options) {
    //show_message('Decoding file...', 0);

    const chunks = [];

    const freq = options.freq || 44100;
    const channels = options.channels || 2;
    const bit_depth = options.bit_depth || 16;

    const bytes_per_sample = bit_depth / 8;

    return new Promise((resolve, reject) => {
        ffmpeg(path)
            .audioCodec(CODEC)
            .audioFrequency(freq)
            .audioChannels(channels)
            .format(FORMAT)
            .on('error', (err) => {
                logger.error('decoding failed!');
                reject(err);
            })
            .pipe()
            .on('data', chunk => chunks.push(chunk))
            .on('end', async () => {
                const pcm_data = Buffer.concat(chunks);

                const num_samples = pcm_data.length / (channels * bytes_per_sample);

                const audioBuffer = audioContext.createBuffer(
                    channels,
                    num_samples,
                    freq
                );

                for (let channel = 0; channel < channels; channel++) {
                    const channelData = audioBuffer.getChannelData(channel);
                    const dataView = new DataView(pcm_data.buffer);

                    for (let i = 0; i < num_samples; i++) {
                        const byteOffset = (i * channels + channel) * bytes_per_sample;
                        const int16Value = dataView.getInt16(byteOffset, true);
                        channelData[i] = Math.max(-1.0, int16Value / 32768.0);
                    }
                }

                resolve(audioBuffer);
            });
    })

}