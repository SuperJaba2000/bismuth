import { init_player_box } from './ui/player-box.js';
import { init_tab_header } from './ui/tab-header.js';
import json5 from 'json5';
import { readFileSync } from 'fs';
import logger from './logger.js';
import { exit } from 'process';


export let ui_options = {};

// import ui styles from json config
function load_ui_options() {
    try {
        return {
            ...json5.parse(readFileSync('./ui-options/player_box.json5', 'utf-8')),
            ...json5.parse(readFileSync('./ui-options/tab_header.json5', 'utf-8'))
        };
    } catch (err) {
        logger.error('Failed to read or parse ui options from json5 file!', err);
        exit(1);
    }
}

export function init_ui(screen) {
    ui_options = load_ui_options();

    init_player_box(screen, ui_options);
    init_tab_header(screen, ui_options);

    screen.render();
}
