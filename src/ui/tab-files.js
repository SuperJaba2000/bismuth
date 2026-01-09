import blessed from 'reblessed';
import { screen } from '../index.js';
import { ui_options } from '../ui.js';
import { load } from '../audio/audio_system.js';
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
        load(file_path)
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