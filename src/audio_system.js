import { StreamAudioContext } from '@descript/web-audio-js';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import Speaker from 'speaker';
import { show_message } from './ui.js';
import { clear_play_time_update, set_play_time_update, update_track_info } from './ui/player-box.js';
import logger from './logger.js';

ffmpeg.setFfmpegPath(ffmpegPath);

export let audio_buffer, audio_context, source_node, gain_node, speaker;

let initialized = false;
export let track_loaded = false;

export let is_playing = false;
export let current_time = 0;

function reset_audio_system() {
    audio_buffer = null;
    audio_context = null;
    source_node = null;
    gain_node = null;

    is_playing = false;
    current_time = 0;

    initialized = false;
    track_loaded = false;

    clear_play_time_update();
}

function init_source_node(set_buffer = false) {
    source_node = audio_context.createBufferSource();
    if (set_buffer)
        source_node.buffer = audio_buffer;

    source_node.connect(gain_node);

    return source_node;
}

function init_audio_system() {
    reset_audio_system();

    audio_context = new StreamAudioContext();
    gain_node = audio_context.createGain();
    init_source_node();

    gain_node.connect(audio_context.destination);

    set_volume(0.5);

    initialized = true;
}

export function set_volume(volume) {
    if (!initialized)
        return;

    gain_node.gain.value = Math.clamp(volume, 0, 1);
}

function play_from(offset) {
    init_source_node(true);
    source_node.start(0, offset);
    audio_context.resume();

    audio_context.pipe(speaker);
    is_playing = true;
}

export function play_decode(file_path) {
    const chunks = [];

    ffmpeg(file_path)
        .audioCodec('pcm_s16le') // Конвертируем в сырой PCM (как WAV)
        .audioFrequency(44100)
        .audioChannels(2)
        .format('s16le') // Формат для сырых данных
        .on('error', (err) => {
            logger.error(err)
        })
        .pipe()
        .on('data', chunk => chunks.push(chunk))
        .on('end', async () => {
            console.log('decode ended!')
            const pcmData = Buffer.concat(chunks);

            const numChannels = 2;
            const sampleRate = 44100;

            const bytesPerSample = 2;
            const numSamples = pcmData.length / (numChannels * bytesPerSample);

            audio_context = new StreamAudioContext();
            audio_context.pipe(new Speaker({
                channels: numChannels,
                bitDepth: 16,
                sampleRate
            }))
            audio_buffer = audio_context.createBuffer(
                numChannels,
                numSamples,
                sampleRate
            );

            for (let channel = 0; channel < numChannels; channel++) {
                const channelData = audio_buffer.getChannelData(channel);
                const dataView = new DataView(pcmData.buffer);

                for (let i = 0; i < numSamples; i++) {
                    const byteOffset = (i * numChannels + channel) * bytesPerSample;
                    const int16Value = dataView.getInt16(byteOffset, true);
                    channelData[i] = Math.max(-1.0, int16Value / 32768.0);
                }
            }

            source_node = audio_context.createBufferSource();
            source_node.buffer = audio_buffer;
            source_node.connect(audio_context.destination);
            source_node.start(0);

            audio_context.resume();
            // source.onended = () => {
            //     audioCtx.close();
            //     resolve();
            // };
        });
}

export async function load_file(file_buffer, track_info) {
    init_audio_system();

    audio_buffer = await audio_context.decodeAudioData(file_buffer.buffer);
    init_source_node(true);

    speaker = new Speaker({
        channels: audio_buffer.numberOfChannels,
        bitDepth: 16,
        sampleRate: audio_buffer.sampleRate
    });

    audio_context.pipe(speaker);

    show_message('File loaded!', 1);
    track_loaded = true;

    set_play_time_update();
    update_track_info(track_info);
}

export async function play_file(file_buffer) {
    if (!initialized)
        init_audio_system();

    if (!track_loaded)
        await load_file(file_buffer);

    play_from(0);
}

export function audio_play_pause() {
    if (is_playing) {
        current_time = audio_context.currentTime;
        source_node.stop();
        audio_context.suspend();
        is_playing = false;
    } else {
        play_from(current_time);
        is_playing = true;
    }
}

export function update_current_time() {
    current_time = audio_context.currentTime;
}