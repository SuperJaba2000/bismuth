import blessed from 'reblessed';
import json5 from 'json5';
import { readFileSync } from 'fs';
import logger from './logger.js';
import { exit } from 'process';


export let ui_options = {};

export let player_box, button_play, button_prev, button_next, play_time, track_title, track_artist;
export let tab_header;


let center_buttons_active = true;
let is_playing = false;
let active_tab = 'files';

// TODO : move to config file
const FG_COLOR_INACTIVE = '#999999';
const BUTTON_PLAY_BORDER_FG = '#ffffaa';
const BUTTON_PLAY_MAIN_FG = 'yellow';
const BUTTONS_PREV_NEXT_FG = 'yellow';

const _button_play_border_fg = () => center_buttons_active ? BUTTON_PLAY_BORDER_FG : FG_COLOR_INACTIVE;
const _button_play_main_fg = () => center_buttons_active ? BUTTON_PLAY_MAIN_FG : FG_COLOR_INACTIVE;
const _buttons_prev_next_fg = () => center_buttons_active ? BUTTONS_PREV_NEXT_FG : FG_COLOR_INACTIVE;
const _button_play_content = () => `{${_button_play_border_fg()}-fg}({/}{${_button_play_main_fg()}-fg} ${is_playing ? '=' : '▶︎'} {/}{${_button_play_border_fg()}-fg}){/}`;
const _button_prev_content = () => `{${_buttons_prev_next_fg()}-fg} << `;
const _button_next_content = () => `{${_buttons_prev_next_fg()}-fg} >> `;

const _tab_display_name = () => active_tab == 'files' ? 'Files' : (active_tab == 'yandex' ? 'Yandex' : 'Config');
const _tab_header_content = () => `switch to tab: ${_tab_display_name()}`;


// import ui styles from json config
function load_ui_options() {
    try {
        return {
            ...json5.parse(readFileSync('./ui/player_box.json5', 'utf-8')),
            ...json5.parse(readFileSync('./ui/tab_header.json5', 'utf-8'))
        };
    } catch (err) {
        logger.error('Failed to read or parse ui options from json5 file!', err);
        exit(1);
    }
}

function init_tab_header(screen) {
    tab_header = blessed.box(ui_options['tab_header']);
    tab_header.setContent(_tab_header_content());

    screen.append(tab_header);

    function change_tab(tab) {
        active_tab = tab;
        tab_header.setContent(_tab_header_content());
        show_tab_header();
        screen.render();
    }

    let animation_frame = 0;
    let animation_interval;
    let animation_timeout;

    function show_tab_header() {
        tab_header.top = -3;
        animation_frame = 0;
        clearTimeout(animation_timeout);
        clearInterval(animation_interval);

        animation_interval = setInterval(() => {
            if(animation_frame >= 2 || tab_header.top >= 0) {
                clearInterval(animation_interval);
                animation_timeout = setTimeout(() => {
                    hide_tab_header();
                }, 1000)
                return;
            }

            tab_header.top += 1;
            screen.render();
            
            animation_frame++;
        }, 200);
    }

    function hide_tab_header() {
        animation_frame = 0;
        clearTimeout(animation_timeout);
        clearInterval(animation_interval);

        animation_interval = setInterval(() => {
            if(animation_frame >= 2 || tab_header.top <= -3) {
                clearInterval(animation_interval);
                return;
            }

            tab_header.top -= 1;
            screen.render();
            
            animation_frame++;
        }, 200);
    }

    screen.key(['tab'], () => {
        if (active_tab === 'config') {
            change_tab('files');
        } else if (active_tab === 'files') {
            change_tab('yandex');
        } else if (active_tab === 'yandex') {
            change_tab('config');
        }
    });
}

function init_player_box(screen) {
    player_box = blessed.box(ui_options['player_box']);

    button_play = blessed.box({
        ...ui_options['button_play'],
        content: _button_play_content()
    });

    // regenerate button play content and rerender screen
    function play_pause() {
        is_playing = !is_playing;
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

export function init_ui(screen) {
    ui_options = load_ui_options();

    init_player_box(screen);
    init_tab_header(screen);
    screen.render();
}
