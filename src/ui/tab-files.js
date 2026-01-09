import blessed from 'reblessed';
import fs from 'fs';
import { load_file } from '../audio_system.js';

import { screen } from '../index.js';

export let tab_files_separator, tab_files_filemanager;

export function init_tab_files(ui_options) {
    tab_files_separator = blessed.line(ui_options['tab_files_separator']);

    screen.append(tab_files_separator);

    tab_files_filemanager = blessed.filemanager({
        ...ui_options['tab_files_filemanager'],
    });

    tab_files_filemanager.cwd = process.cwd();

    tab_files_filemanager.on('file', async (file_path) => {
        const file_buffer = fs.readFileSync(file_path);
        load_file(file_buffer)
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