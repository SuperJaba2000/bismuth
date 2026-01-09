import json5 from 'json5';
import { readFileSync } from 'fs';
import { exit } from 'process';
import logger from './logger.js';
import blessed from 'reblessed';

import { screen } from './index.js';
import { init_player_box } from './ui/player-box.js';
import { show_active_tab, init_tab_header } from './ui/tab-header.js';
import { hide_tab_files, init_tab_files, show_tab_files } from './ui/tab-files.js';



export let ui_options = {};

export let message_box;

// import ui styles from json config
function load_ui_options() {
    try {
        return {
            ...json5.parse(readFileSync('./ui-options/global.json5', 'utf-8')),
            ...json5.parse(readFileSync('./ui-options/player_box.json5', 'utf-8')),
            ...json5.parse(readFileSync('./ui-options/tab_header.json5', 'utf-8')),
            ...json5.parse(readFileSync('./ui-options/tab_files.json5', 'utf-8'))
        };
    } catch (err) {
        logger.error('Failed to read or parse ui options from json5 file!', err);
        exit(1);
    }
}

export function show_message(text, timeout_s) {
    message_box = blessed.message(ui_options['message_box']);
    screen.append(message_box);

    message_box.display(text, timeout_s);

    screen.render();
}

export function init_ui() {
    ui_options = load_ui_options();

    init_tab_files();
    init_tab_header();
    init_player_box();

    hide_tab_files();
    //hide_tab_yandex();
    //hide_tab_config();
    
    show_active_tab();

    screen.render();
}