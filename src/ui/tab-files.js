import blessed from 'reblessed';
import fs from 'fs';
import { StreamAudioContext} from '@descript/web-audio-js';
import Speaker from 'speaker';
import logger from '../logger.js';


export let tab_files_separator, tab_files_filemanager;

let audio_buffer;
let audio_context, source_node, gain_node;

let is_playing = false;
let play_time = 0;

async function play_audio(file_buffer, offset = 0) {
    try {
        audio_context = new StreamAudioContext();
        gain_node = audio_context.createGain();

        // todo : add volume control
        gain_node.gain.value = 1.0;

        if(!audio_buffer)
            audio_buffer = await audio_context.decodeAudioData(file_buffer.buffer);

        source_node = audio_context.createBufferSource();
        source_node.buffer = audio_buffer;

        source_node.connect(gain_node);
        gain_node.connect(audio_context.destination);

        audio_context.pipe(new Speaker({
            channels: audio_buffer.numberOfChannels,
            bitDepth: 16,
            sampleRate: audio_buffer.sampleRate
        }));
        
        source_node.start(0, offset);
        is_playing = true;

        audio_context.resume();
    } catch (e) {
        logger.error(e.stack);
    }
}

export function audio_play_pause() {
    if(is_playing) {
        play_time += audio_context.currentTime;
        console.log(play_time)
        audio_context.suspend();
        source_node.stop();
        is_playing = false;
    } else {
        play_audio(audio_buffer, play_time);
        is_playing = true;
    }
}


export function init_tab_files(screen, ui_options) {
    tab_files_separator = blessed.line(ui_options['tab_files_separator']);

    screen.append(tab_files_separator);

    tab_files_filemanager = blessed.filemanager({
        ...ui_options['tab_files_filemanager'],
    });

    tab_files_filemanager.cwd = process.cwd();

    tab_files_filemanager.on('file', async (file_path) => {
        const file_buffer = fs.readFileSync(file_path);
        play_audio(file_buffer);
    });

    tab_files_filemanager.refresh(process.cwd(), () => {
        tab_files_filemanager.focus();
    });

    screen.append(tab_files_filemanager);
}

export function hide_tab_files() {
    tab_files_separator.hide();
    tab_files_filemanager.hide();
}

export function show_tab_files() {
    tab_files_separator.show();
    tab_files_filemanager.show();
}