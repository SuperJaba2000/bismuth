import blessed from "reblessed";
import { screen } from "../../index.js";
import { ui_options } from "../../ui.js";
import { is_playing, next_track, play_pause, previous_track } from "../../audio/audio-system.js";

export let button_play, button_prev, button_next;


const central_buttons_active = () => true;

const _button_play_border_fg = () => central_buttons_active() ? ui_options['button_play_border_fg'] : ui_options['fg_color_inactive'];
const _button_play_main_fg = () => central_buttons_active() ? ui_options['button_play_main_fg'] : ui_options['fg_color_inactive'];
const _buttons_prev_next_fg = () => central_buttons_active() ? ui_options['buttons_prev_next_fg'] : ui_options['fg_color_inactive'];
const _button_play_content = () => `{${_button_play_border_fg()}-fg}({${_button_play_main_fg()}-fg} ${is_playing ? '=' : '▶︎'} {${_button_play_border_fg()}-fg})`;
const _button_prev_content = () => `{${_buttons_prev_next_fg()}-fg} << `;
const _button_next_content = () => `{${_buttons_prev_next_fg()}-fg} >> `;


function button_play_click() {
    play_pause();
}

function button_prev_click() {
    previous_track();
}

function button_next_click() {
    next_track();
}

export function update_central_buttons() {
    button_play.setContent(_button_play_content());
    button_prev.setContent(_button_prev_content());
    button_next.setContent(_button_next_content());

    screen.render();
}

export function init_central_buttons() {
    button_play = blessed.box(ui_options['button_play']);
    button_prev = blessed.box(ui_options['button_prev']);
    button_next = blessed.box(ui_options['button_next']);

    button_play.on('click', () => button_play_click());
    button_prev.on('click', () => button_prev_click());
    button_next.on('click', () => button_next_click());

    update_central_buttons();
}

