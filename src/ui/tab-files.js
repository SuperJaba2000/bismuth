import blessed from 'reblessed';
import { screen } from '../index.js';
import { ui_options, show_message } from '../ui.js';
import { load_and_play_track } from '../audio/audio-system.js';
import { active_tab } from './tab-header.js';
import { clamp, get_screen_size } from '../util.js';
import Track from '../tracks/Track.js';


export let tab_files_separator, tab_files_filemanager;

export function init_tab_files() {
    tab_files_separator = blessed.line(ui_options['tab_files_separator']);

    // draggable separator with constant y coordinate
    screen.on('prerender', () => {
        if(active_tab !== 'files') return;

        tab_files_separator.left = clamp(tab_files_separator.left, 20, get_screen_size().width - 20);

        tab_files_separator.top = ui_options['tab_files_separator'].top;
        tab_files_filemanager.left = tab_files_separator.left + 3;
    })

    let separator_active = false;

    screen.on('mouse', data => {
        if(active_tab !== 'files') return;

        const event_on_separator = (data.x === tab_files_separator.aleft && (data.y >= tab_files_separator.top && data.y < tab_files_separator.top + tab_files_separator.height));

        if(data.action === 'mousedown' && data.button === 'left') {
            if(event_on_separator){
                if(!separator_active) {
                    tab_files_separator.style.fg = 'white';
                    separator_active = true;
                    screen.render();
                }
            }
        } else if(data.action === 'mouseup' && data.button === 'left') {
            if(separator_active) {
                tab_files_separator.style.fg = 'gray';
                separator_active = false;
                screen.render();
            }
        }
    });

    tab_files_filemanager = blessed.filemanager(ui_options['tab_files_filemanager']);

    tab_files_filemanager.on('file', async (file_path) => {
        show_message('Loading file...', 0);

        const track = new Track(file_path);
        await track.load();
        load_and_play_track(track);
    });

    tab_files_filemanager.refresh(process.cwd(), () => {
        tab_files_filemanager.focus();
    });

    screen.append(tab_files_separator);
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