import blessed from 'reblessed';
import { screen } from '../../index.js';
import { ui_options } from '../../ui.js';
import { init_central_buttons, button_play, button_prev, button_next, update_central_buttons } from './central-buttons.js';
import { init_progress_bar, progress_bar, update_progress_bar } from './progress-bar.js';
import { init_track_info, track_time, track_title, track_artist, update_track_info } from './track-info.js';

export let player_box;

export function init_player_box() {
    init_track_info();
    init_central_buttons();
    init_progress_bar();

    player_box = blessed.box(ui_options['player_box']);

    player_box.append(track_time);
    player_box.append(track_title);
    player_box.append(track_artist);

    player_box.append(button_play);
    player_box.append(button_prev);
    player_box.append(button_next);

    player_box.append(progress_bar);

    screen.append(player_box);
}

export function show_player_box() {
    player_box.show();
    screen.render();
}

export function hide_player_box() {
    player_box.hide();
    screen.render();
}

export function update_player_box() {
    update_track_info();
    update_central_buttons();
    update_progress_bar();
}

// deprecated
export function clear_play_time_update() {}
export function set_play_time_update() {}