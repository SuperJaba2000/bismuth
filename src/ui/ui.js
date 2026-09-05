import json5 from 'json5';
import { readFileSync } from 'fs';
import { exit } from 'process';
import logger from '../util/logger.js';
import blessed from 'reblessed';

import { screen } from '../index.js';
import { hide_player_box, init_player_box } from './player-box/player-box.js';
import { show_active_tab, init_tab_header, tab_header, show_tab_header } from './tabs/tab-header.js';
import { hide_tab_files, init_tab_files } from './tabs/tab-files.js';
import { init_tab_welcome } from './tabs/tab-welcome.js';


export let ui_options = {};

let message_box;
let message_box_initialized = false;

// import ui styles from json config
function load_ui_options() {
    logger.info('[UI] loading ui options...');
    try {
        return {
            ...json5.parse(readFileSync('./ui-options/global.json5', 'utf-8')),
            ...json5.parse(readFileSync('./ui-options/player_box.json5', 'utf-8')),
            ...json5.parse(readFileSync('./ui-options/tab_header.json5', 'utf-8')),
            ...json5.parse(readFileSync('./ui-options/tab_welcome.json5', 'utf-8')),
            ...json5.parse(readFileSync('./ui-options/tab_files.json5', 'utf-8'))
        };
    } catch (err) {
        logger.error('[UI] Failed to read or parse ui options from json5 file!', err);
        // let user see error message for 3 seconds and then exit
        setTimeout(() => exit(1), 3000);
    }
}

export function show_message(text, timeout_s) {
    if(!message_box_initialized) {
        message_box = blessed.message(ui_options['message_box']);
        screen.append(message_box);

        message_box_initialized = true;
    }

    message_box.display(text, timeout_s);

    screen.render();

    return message_box;
}

export function init_ui() {
    logger.info('[UI] initializing ui...');
    ui_options = load_ui_options();
    logger.info('[UI] ui options successfully loaded');

    init_tab_welcome();
    init_tab_files();
    init_tab_header();
    init_player_box();

    hide_player_box();

    hide_tab_files();
    //hide_tab_yandex();
    //hide_tab_config();
    
    show_active_tab();

    logger.info('[UI] ui initialized');

    screen.render();
    logger.info('[UI] screen rendered');

    tab_header.setContent('Welcome to Bismuth!');
    show_tab_header();
}