import blessed from 'reblessed';
import { screen } from '../index.js';
import { ui_options, show_message } from '../ui.js';
import { load_and_play_track } from '../audio/audio-system.js';
import Track from '../tracks/Track.js';

export let tab_files_separator, tab_files_filemanager;


export function init_tab_files() {
    tab_files_separator = blessed.line(ui_options['tab_files_separator']);

    screen.append(tab_files_separator);

    tab_files_filemanager = blessed.filemanager({
        ...ui_options['tab_files_filemanager'],
    });

    tab_files_filemanager.cwd = process.cwd();

    tab_files_filemanager.on('file', async (file_path) => {
        show_message('Loading file...', 0);
        
        const track = new Track(file_path);
        await track.load();
        load_and_play_track(track);
    });

    tab_files_filemanager.refresh(process.cwd(), () => {
        tab_files_filemanager.focus();
    });

    screen.append(tab_files_filemanager);
}

export function hide_tab_files() {
    tab_files_separator.hide();
    tab_files_filemanager.hide();
    screen.render();
}

export function show_tab_files() {
    tab_files_separator.show();
    tab_files_filemanager.show();
    tab_files_filemanager.focus();

    screen.render();
}