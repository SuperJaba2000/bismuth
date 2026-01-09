import { StreamAudioContext } from '@descript/web-audio-js';
import { readFileSync } from 'fs';
import { extname } from 'path';
import Speaker from 'speaker';
import { show_message } from '../ui.js';
import { clear_play_time_update, set_play_time_update, update_track_info } from '../ui/player-box.js';
import { decode } from './decoder.js';
import logger from '../logger.js';

export let audio_buffer, audio_context, source_node, gain_node, speaker;

export let track_loaded = false;

export let is_playing = false;
export let current_time = 0;


// initialize audio system (only once)
export function init_audio_system() {
    audio_context = new StreamAudioContext();
    gain_node = audio_context.createGain();
    gain_node.connect(audio_context.destination);
}

// remove all data that can be associated with previous track
export function reset_audio_system() {
    audio_buffer = null;
    source_node = null;
    speaker = null;

    is_playing = false;
    track_loaded = false;
    current_time = 0;

    // clear play time update (ui)
    clear_play_time_update();
}

export function set_volume(volume) {
    gain_node.gain.value = Math.clamp(volume, 0, 1);
}

function create_source_node() {
    source_node = audio_context.createBufferSource();
    source_node.buffer = audio_buffer;
    source_node.connect(gain_node);
}

// call at every change of audio_buffer (numberOfChannels, sampleRate can change!)
function create_speaker() {
    speaker = new Speaker({
        channels: audio_buffer.numberOfChannels || 2,
        sampleRate: audio_buffer.sampleRate || 44100,
        bitDepth: 16,
    });

    audio_context.pipe(speaker);
}



// only if speaker is initialized
function play_from(timestamp) {
    create_source_node();

    audio_context.pipe(speaker);

    source_node.start(0, timestamp);
    audio_context.resume();

    is_playing = true;
}



// only .wav files (raw PCM)
async function load_wav(file_path) {
    const file_buffer = readFileSync(file_path);
    audio_buffer = await audio_context.decodeAudioData(file_buffer.buffer);

    create_speaker();

    track_loaded = true;
    show_message('File loaded!', 1);

    // ui
    set_play_time_update();
}

// supports .mp3, .wav, .ogg, .aac, ...
function load_with_decode(file_path) {
    decode(file_path, {
        freq: 44100,
        channels: 2,
        bit_depth: 16
    }).then(decoded_audio_buffer => {
        audio_buffer = decoded_audio_buffer;

        create_speaker();


        track_loaded = true;
        show_message('File loaded!', 1);

        // ui
        set_play_time_update();
    }).catch(err => {
        logger.error(err);
        show_message('Failed to decode file!', 1);
    })
}

export function load(file_path) {
    if(extname(file_path) === '.wav') {
        load_wav(file_path);
    } else {
        load_with_decode(file_path);
    }
}


export function audio_play_pause() {
    if(!track_loaded) return;

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