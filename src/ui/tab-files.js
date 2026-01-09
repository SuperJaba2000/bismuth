import blessed from 'reblessed';
import { screen } from '../index.js';
import { ui_options } from '../ui.js';
import { readFileSync } from 'fs';
import { load_file, play_decode } from '../audio_system.js';
import path, { basename } from 'path';



export let tab_files_separator, tab_files_filemanager;

export function init_tab_files() {
    tab_files_separator = blessed.line(ui_options['tab_files_separator']);

    screen.append(tab_files_separator);

    tab_files_filemanager = blessed.filemanager({
        ...ui_options['tab_files_filemanager'],
    });

    tab_files_filemanager.cwd = process.cwd();

    tab_files_filemanager.on('file', async (file_path) => {
        const file_buffer = readFileSync(file_path);
        if(path.extname(file_path) !== '.wav') {
            play_decode(file_path);
            return;    
        }

        const track_info = {
            title: basename(file_path),
            artist: 'Unknown',
        };

        load_file(file_buffer, track_info);
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