import blessed from 'reblessed';
import json5 from 'json5';
import { readFileSync } from 'fs';
import logger from './logger.js';
import { exit } from 'process';


export let ui_options = {};

export let player_box, button_play, button_prev, button_next, play_time, track_title, track_artist;
export let tab_file, tab_yandex, tab_options, tab_header;


let center_buttons_active = true;
let is_playing = false;
let active_tab = 'file';

// TODO : move to config file
const FG_COLOR_INACTIVE = '#999999';
const BUTTON_PLAY_BORDER_FG = '#ffffaa';
const BUTTON_PLAY_MAIN_FG = 'yellow';
const BUTTONS_PREV_NEXT_FG = 'yellow';

const BUTTON_TAB_BG_INACTIVE = '#333333';
const BUTTON_TAB_BG_ACTIVE = '#0da200';
const BUTTON_TAB_FG_INACTIVE = '#999999';
const BUTTON_TAB_FG_ACTIVE = 'white';

const _button_play_border_fg = () => center_buttons_active ? BUTTON_PLAY_BORDER_FG : FG_COLOR_INACTIVE;
const _button_play_main_fg = () => center_buttons_active ? BUTTON_PLAY_MAIN_FG : FG_COLOR_INACTIVE;
const _buttons_prev_next_fg = () => center_buttons_active ? BUTTONS_PREV_NEXT_FG : FG_COLOR_INACTIVE;
const _button_play_content = () => `{${_button_play_border_fg()}-fg}({/}{${_button_play_main_fg()}-fg} ${is_playing ? '=' : '▶︎'} {/}{${_button_play_border_fg()}-fg}){/}`;
const _button_prev_content = () => `{${_buttons_prev_next_fg()}-fg} << `;
const _button_next_content = () => `{${_buttons_prev_next_fg()}-fg} >> `;

const _button_tab_options_content = () => {
    if (active_tab === 'options') {
        return `{${BUTTON_TAB_BG_ACTIVE}-bg}{${BUTTON_TAB_FG_ACTIVE}-fg}options{/}`;
    } else {
        return `{${BUTTON_TAB_BG_INACTIVE}-bg}{${BUTTON_TAB_FG_INACTIVE}-fg}options{/}`;
    }
};

const _button_tab_yandex_content = () => {
    if (active_tab === 'yandex') {
        return `{${BUTTON_TAB_BG_ACTIVE}-bg}{${BUTTON_TAB_FG_ACTIVE}-fg}yandex{/}`;
    } else {
        return `{${BUTTON_TAB_BG_INACTIVE}-bg}{${BUTTON_TAB_FG_INACTIVE}-fg}yandex{/}`;
    }
};

const _button_tab_file_content = () => {
    if (active_tab === 'file') {
        return `{${BUTTON_TAB_BG_ACTIVE}-bg}{${BUTTON_TAB_FG_ACTIVE}-fg}files{/}`;
    } else {
        return `{${BUTTON_TAB_BG_INACTIVE}-bg}{${BUTTON_TAB_FG_INACTIVE}-fg}files{/}`;
    }
};



// import ui styles from json config
function load_ui_options() {
    try {
        return {
            ...json5.parse(readFileSync('./ui/player_box.json5', 'utf-8')),
            ...json5.parse(readFileSync('./ui/tabs.json5', 'utf-8'))
        };
    } catch (err) {
        logger.error('Failed to read or parse ui options from json5 file!', err);
        exit(1);
    }
}

function init_tabs(screen) {
    tab_options = blessed.box({
        ...ui_options['tab_options'],
        content: _button_tab_options_content()
    });

    tab_yandex = blessed.box({
        ...ui_options['tab_yandex'],
        content: _button_tab_yandex_content()
    });

    tab_file = blessed.box({
        ...ui_options['tab_file'],
        content: _button_tab_file_content()
    });

    function change_tab(tab) {
        active_tab = tab;
        tab_options.setContent(_button_tab_options_content());
        tab_yandex.setContent(_button_tab_yandex_content());
        tab_file.setContent(_button_tab_file_content());
        screen.render();
    }

    tab_options.on('click', () => change_tab('options'));
    tab_yandex.on('click', () => change_tab('yandex'));
    tab_file.on('click', () => change_tab('file'));

    screen.append(tab_options);
    screen.append(tab_yandex);
    screen.append(tab_file);
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
    init_tabs(screen);
    screen.render();
}
