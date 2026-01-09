import { StreamAudioContext} from '@descript/web-audio-js';
import Speaker from 'speaker';
import { show_message } from './ui.js';


let audio_buffer, audio_context, source_node, gain_node, speaker;

let initialized = false;

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
}

function init_audio_system() {
    if(initialized)
        reset_audio_system();

    audio_context = new StreamAudioContext();
    gain_node = audio_context.createGain();
    source_node = audio_context.createBufferSource();

    source_node.connect(gain_node);
    gain_node.connect(audio_context.destination);

    set_volume(1);

    initialized = true;
}

export function set_volume(volume) {
    if(!initialized)
        return;

    gain_node.gain.value = Math.clamp(volume, 0, 1);
}

function play_from(offset) {
    audio_context.resume();
    source_node.start(0, offset);
    is_playing = true;

    
}

export async function load_file(file_buffer) {
    if(!initialized)
        init_audio_system();

    audio_buffer = await audio_context.decodeAudioData(file_buffer.buffer);
    source_node.buffer = audio_buffer;

    speaker = new Speaker({
        channels: audio_buffer.numberOfChannels,
        bitDepth: 16,
        sampleRate: audio_buffer.sampleRate
    });

    audio_context.pipe(speaker);

    show_message('File loaded!', 1);
}

export async function play_file(file_buffer) {
    if(!initialized)
        init_audio_system();

    await load_file(file_buffer);
    play_from(0);
}

export function audio_play_pause() {
    if(is_playing) {
        current_time += audio_context.currentTime;
        audio_context.suspend();
        source_node.stop();
        is_playing = false;
    } else {
        play_from(current_time);
        console.log(current_time)
        is_playing = true;
    }
}