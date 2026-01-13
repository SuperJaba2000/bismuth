import logger from '../logger.js';
import { StreamAudioContext } from '@descript/web-audio-js';
import { readFileSync } from 'fs';
import { extname } from 'path';
import Speaker from 'speaker';
import { clamp } from '../util.js';
import { show_message } from '../ui.js';
import { clear_play_time_update, set_play_time_update, update_player_box } from '../ui/player-box/player-box.js';
import { decode } from './decoder.js';
import { get_track_info } from './audio_info.js';

export let audio_context, source_node, gain_node, speaker;
export let track_loaded = false;
export let track_info = {};
export let is_playing = false;

// none, playlist, track
export let repeat_type = 'none';

let audio_buffer;
let playback_start_time = 0;
let playback_offset = 0;
export let current_position = 0;

function log(message, ...args) {
    logger.info(`[AUDIO] ${message}`, ...args);
}

// simplified initialization (for the first time only)
export function init_audio_system() {
    log('starting audio system initialization...');

    audio_context = new StreamAudioContext();
    gain_node = audio_context.createGain();
    gain_node.connect(audio_context.destination);

    log('audio system initialized successfully');
}

// deleting everything that could refer to the previous track
export function reset_audio_system() {
    log('resetting audio system...');

    if (source_node) {
        try {
            source_node.stop();
        } catch (e) { }
        source_node = null;
    }

    if (speaker) {
        speaker.end();
        speaker = null;
    }

    audio_buffer = null;

    if (!audio_context || audio_context.state === 'closed') {
        audio_context = new StreamAudioContext();
        gain_node = audio_context.createGain();
        gain_node.connect(audio_context.destination);

        set_volume(0.5);
    }

    is_playing = false;
    track_loaded = false;
    track_info = {};
    playback_start_time = 0;
    playback_offset = 0;
    current_position = 0;

    log('call clear_play_time_update()');
    clear_play_time_update();
    update_player_box();

    log('audio system reset successfully');
}

function create_speaker() {
    log('creating new speaker...');
    if (speaker) {
        speaker.end();
    }

    speaker = new Speaker({
        channels: audio_buffer.numberOfChannels || 2,
        sampleRate: audio_buffer.sampleRate || 44100,
        bitDepth: 16,
    });

    audio_context.pipe(speaker);
    log('speaker created successfully');
}

export function set_volume(volume) {
    log('changing volume to', volume);
    if (gain_node) {
        gain_node.gain.value = clamp(volume, 0, 1);
    }
}

export function audio_change_repeat_type() {
    if(repeat_type == 'none') {
        repeat_type = 'playlist';
    } else if(repeat_type == 'playlist') {
        repeat_type = 'track';
    } else if(repeat_type == 'track') {
        repeat_type = 'none';
    }

    update_player_box();
}

function play_from(position) {
    log('play_from() called, position:', position);

    if (source_node) {
        try {
            source_node.stop();
        } catch (e) { }

        source_node = null;
    }

    source_node = audio_context.createBufferSource();
    source_node.buffer = audio_buffer;
    source_node.connect(gain_node);

    playback_start_time = audio_context.currentTime;
    playback_offset = position;

    source_node.start(0, position);

    if (audio_context.state === 'suspended') {
        audio_context.resume();
    }

    is_playing = true;
    current_position = position;

    update_player_box();

    log('play_from() successfully finished');
}

function get_current_position() {
    if (!is_playing || !audio_buffer) {
        return current_position;
    }

    const elapsed = audio_context.currentTime - playback_start_time;
    const new_position = playback_offset + elapsed;

    if (new_position >= audio_buffer.duration) {
        if(repeat_type === 'none' || repeat_type === 'playlist') {
            current_position = audio_buffer.duration;
            is_playing = false;
            update_player_box();
            return current_position;
        }else if(repeat_type === 'track') {
            play_from(0);
            return 0;
        }
    }

    current_position = new_position;
    return current_position;
}

async function load_wav(file_path) {
    log('loading wav file...');
    try {
        const file_buffer = readFileSync(file_path);
        audio_buffer = await audio_context.decodeAudioData(file_buffer.buffer);

        create_speaker();

        track_loaded = true;
        track_info = await get_track_info(file_path);

        show_message('File loaded!', 1);
        log('track successfully loaded!');

        update_player_box();
        set_play_time_update();
    } catch (error) {
        logger.error('Failed to load WAV:', error);
        show_message('Failed to load file!', 1);
    }
}

async function load_with_decode(file_path) {
    log('trying to decode file...');
    try {
        const decoded_audio_buffer = await decode(file_path, {
            freq: 44100,
            channels: 2,
            bit_depth: 16
        });

        audio_buffer = decoded_audio_buffer;
        create_speaker();

        track_loaded = true;
        track_info = await get_track_info(file_path);

        show_message('File loaded!', 1);
        log('track successfully decoded and loaded!');

        update_player_box();
        set_play_time_update();
    } catch (error) {
        logger.error('Failed to decode file: ', error);
        show_message('Failed to decode file!', 1);
    }
}

export function load_track(file_path) {
    log('loading track: ', file_path);

    reset_audio_system();

    if (extname(file_path) === '.wav') {
        load_wav(file_path);
    } else {
        // TODO : check file extension before decoding
        load_with_decode(file_path);
    }
}

export function audio_play_pause() {
    if (!track_loaded || !audio_buffer) return;

    if (is_playing) {
        current_position = get_current_position();

        try {
            source_node.stop();
        } catch (e) { }
        source_node = null;

        audio_context.suspend();
        is_playing = false;

        update_player_box();
    } else {
        play_from(current_position);
    }
}

export function update_current_position() {
    if (!track_loaded) return 0;
    return get_current_position();
}

export function rewind_to(position) {
    if (!track_loaded || !audio_buffer) return;

    const new_position = clamp(position, 0, audio_buffer.duration);

    if (is_playing) {
        play_from(new_position);
    } else {
        current_position = new_position;
    }
}