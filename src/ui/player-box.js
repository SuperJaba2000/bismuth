import blessed from 'reblessed';
import { screen } from '../index.js';
import { ui_options } from '../ui.js';
import { is_playing, update_current_time, current_time, audio_play_pause, track_loaded, track_info } from '../audio/audio_system.js';


export let progress_bar, player_box, button_play, button_prev, button_next, play_time, track_title, track_artist;

// TODO : move to config file
const FG_COLOR_INACTIVE = '#999999';
const BUTTON_PLAY_BORDER_FG = '#ffffaa';
const BUTTON_PLAY_MAIN_FG = 'yellow';
const BUTTONS_PREV_NEXT_FG = 'yellow';
const FG_PROGRESS_BAR_ACTIVE = 'yellow';
const FG_PROGRESS_BAR_INACTIVE = '#ffffaa';

const MAX_TRACK_TITLE_LENGTH = 30;
const MAX_TRACK_ARTIST_LENGTH = 20;

export let center_buttons_active = true;

const _button_play_border_fg = () => center_buttons_active ? BUTTON_PLAY_BORDER_FG : FG_COLOR_INACTIVE;
const _button_play_main_fg = () => center_buttons_active ? BUTTON_PLAY_MAIN_FG : FG_COLOR_INACTIVE;
const _buttons_prev_next_fg = () => center_buttons_active ? BUTTONS_PREV_NEXT_FG : FG_COLOR_INACTIVE;
const _button_play_content = () => `{${_button_play_border_fg()}-fg}({/}{${_button_play_main_fg()}-fg} ${is_playing ? '=' : '▶︎'} {/}{${_button_play_border_fg()}-fg}){/}`;
const _button_prev_content = () => `{${_buttons_prev_next_fg()}-fg} << `;
const _button_next_content = () => `{${_buttons_prev_next_fg()}-fg} >> `;

const _progress_bar_length = () => process.stdout.columns - 5;
const _progress_bar_content = () => {
    const percent = track_loaded ? Math.floor((current_time / track_info.duration) * 100) : 0;
    const active_length = Math.floor((percent / 100) * _progress_bar_length());
    const inactive_length = _progress_bar_length() - active_length;
    return `{${FG_PROGRESS_BAR_ACTIVE}-fg}${'-'.repeat(active_length)}{/}{${FG_PROGRESS_BAR_INACTIVE}-fg}${'-'.repeat(inactive_length)}{/}`;
};

const _play_time_format = () => {
    const minutes = Math.floor(current_time / 60);
    const seconds = Math.floor(current_time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
};
const _track_time_format = () => {
    const duration = track_info?.duration || 0;
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
};
const _play_time_content = () => track_loaded ? `${_play_time_format()}|${_track_time_format()}` : `00:00|00:00`;

let play_time_update_interval;

export function set_play_time_update() {
    play_time_update_interval = setInterval(() => {
        update_current_time();
        progress_bar.setContent(_progress_bar_content());
        play_time.setContent(_play_time_content());
        screen.render();
    }, 500);
}

export function clear_play_time_update() {
    clearInterval(play_time_update_interval);
}

export function update_track_info(track_info) {
    track_title.setContent(track_info.title);
    track_title.width = Math.min(track_info.title.length, MAX_TRACK_TITLE_LENGTH);
    track_artist.setContent(track_info.artist);
    track_artist.width = Math.min(track_info.artist.length, MAX_TRACK_ARTIST_LENGTH);
    track_artist.left = track_title.left + track_title.width;
    screen.render();
}

export function init_player_box() {
    progress_bar = blessed.box({
        ...ui_options['progress_bar'],
        content: _progress_bar_content()
    });
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
    player_box.append(track_title);
    player_box.append(track_artist);

    // medium
    player_box.append(play_time);

    // very important to show
    player_box.append(button_play);
    player_box.append(button_prev);
    player_box.append(button_next);

    screen.append(player_box);
    screen.append(progress_bar);
}