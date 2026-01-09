import { StreamAudioContext} from '@descript/web-audio-js';
import Speaker from 'speaker';
import { show_message } from './ui.js';
import { clear_play_time_update, set_play_time_update, update_track_info } from './ui/player-box.js';


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

function init_source_node(set_buffer=false) {
    source_node = audio_context.createBufferSource();
    if(set_buffer)
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
    if(!initialized)
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
    if(!initialized)
        init_audio_system();

    if(!track_loaded)
        await load_file(file_buffer);

    play_from(0);
}

export function audio_play_pause() {
    if(is_playing) {
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