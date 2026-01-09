import blessed from 'reblessed';
import { screen } from '../index.js';
import { ui_options } from '../ui.js';
import { is_playing, update_current_time, current_time, audio_play_pause, track_loaded } from '../audio/audio_system.js';


export let player_box, button_play, button_prev, button_next, play_time, track_title, track_artist;

// TODO : move to config file
const FG_COLOR_INACTIVE = '#999999';
const BUTTON_PLAY_BORDER_FG = '#ffffaa';
const BUTTON_PLAY_MAIN_FG = 'yellow';
const BUTTONS_PREV_NEXT_FG = 'yellow';

export let center_buttons_active = true;

const _button_play_border_fg = () => center_buttons_active ? BUTTON_PLAY_BORDER_FG : FG_COLOR_INACTIVE;
const _button_play_main_fg = () => center_buttons_active ? BUTTON_PLAY_MAIN_FG : FG_COLOR_INACTIVE;
const _buttons_prev_next_fg = () => center_buttons_active ? BUTTONS_PREV_NEXT_FG : FG_COLOR_INACTIVE;
const _button_play_content = () => `{${_button_play_border_fg()}-fg}({/}{${_button_play_main_fg()}-fg} ${is_playing ? '=' : '▶︎'} {/}{${_button_play_border_fg()}-fg}){/}`;
const _button_prev_content = () => `{${_buttons_prev_next_fg()}-fg} << `;
const _button_next_content = () => `{${_buttons_prev_next_fg()}-fg} >> `;

const _play_time_format = () => {

    const minutes = Math.floor(current_time / 60);
    const seconds = Math.floor(current_time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
};
const _track_time_format = () => '00:00';
const _play_time_content = () => track_loaded ? `${_play_time_format()}|${_track_time_format()}` : `00:00|00:00`;

let play_time_update_interval;

export function set_play_time_update() {
    play_time_update_interval = setInterval(() => {
        update_current_time();
        play_time.setContent(_play_time_content());
        screen.render();
    }, 500);
}

export function clear_play_time_update() {
    clearInterval(play_time_update_interval);
}

export function update_track_info(track_info) {
    track_title.setContent(track_info.title);
    track_artist.setContent(track_info.artist);
    screen.render();
}

export function init_player_box() {
    player_box = blessed.box(ui_options['player_box']);

    button_play = blessed.box({
        ...ui_options['button_play'],
        content: _button_play_content()
    });

    // regenerate button_play content and rerender screen
    function play_pause() {
        audio_play_pause();

        button_play.setContent(_button_play_content());
        screen.render();
    }

    button_play.on('click', play_pause);
    screen.key(['space'], play_pause);

    button_prev = blessed.box({
        ...ui_options['button_prev'],
        content: _button_prev_content()
    });

    button_next = blessed.box({
        ...ui_options['button_next'],
        content: _button_next_content()
    });

    play_time = blessed.box(ui_options['play_time']);
    track_title = blessed.box(ui_options['track_title']);
    track_artist = blessed.box(ui_options['track_artist']);

    // append order is important! 
    // overlays are possible when the window is reduced!

    // low important
    player_box.append(play_time);

    // medium
    player_box.append(track_title);
    player_box.append(track_artist);

    // very important to show
    player_box.append(button_play);
    player_box.append(button_prev);
    player_box.append(button_next);

    screen.append(player_box);
}