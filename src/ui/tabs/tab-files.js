import blessed from 'reblessed';
import { screen } from '../../index.js';
import { ui_options, show_message } from '../ui.js';
import { load_and_play_track, current_playlist } from '../../audio/audio-system.js';
import { active_tab } from './tab-header.js';
import { clamp, get_screen_size } from '../../util/util.js';
import Track from '../../tracks/Track.js';


export let tab_files_separator, tab_files_filemanager, tab_files_playlist, tab_files_playlist_header;

function _track_content(track) {
    return current_track == track ? `> ${track.title} - ${track.artist}` : `  ${track.title} - ${track.artist}`;
}

export function update_playlist() {
    tab_files_playlist.clearItems();
    for (const track of current_playlist.tracks) {
        tab_files_playlist.add(_track_content(track));
    }
}

export function init_tab_files() {
    tab_files_separator = blessed.line(ui_options['tab_files_separator']);
    tab_files_playlist = blessed.list(ui_options['tab_files_playlist']);
    tab_files_playlist_header = blessed.box(ui_options['tab_files_playlist_header']);

    update_playlist();

    // draggable separator with constant y coordinate
    screen.on('prerender', () => {
        if(active_tab !== 'files') return;

        tab_files_separator.left = clamp(tab_files_separator.left, 23, get_screen_size().width - 20);

        tab_files_separator.top = ui_options['tab_files_separator'].top;
        tab_files_filemanager.left = tab_files_separator.left + 3;

        tab_files_playlist.width = tab_files_separator.left - 3;
        tab_files_playlist_header.width = tab_files_playlist.width;
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

    screen.append(tab_files_playlist);
    screen.append(tab_files_playlist_header);
    screen.append(tab_files_separator);
    screen.append(tab_files_filemanager);
}

export function hide_tab_files() {
    tab_files_playlist.hide();
    tab_files_playlist_header.hide();
    tab_files_separator.hide();
    tab_files_filemanager.hide();
    screen.render();
}

export function show_tab_files() {
    tab_files_playlist.show();
    tab_files_playlist_header.show();
    tab_files_separator.show();
    tab_files_filemanager.show();

    tab_files_filemanager.focus();

    screen.render();
}