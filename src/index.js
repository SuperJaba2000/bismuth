import logger from './util/logger.js';
import blessed from 'reblessed';
import { init_ui } from './ui/ui.js';
import { init_audio_system } from './audio/audio-system.js';
import { init_important_keybindings, init_keybindings } from './util/keybindings.js';

// TODO: move to config
const DEBUG = true;


export const screen = blessed.screen({
    smartCSR: true,
    terminal: 'xterm-256color',
    title: 'Bismuth Player',
    //fullUnicode: true
});

init_important_keybindings();

function init() {
    logger.info('starting the main initialization...');

    process.title = 'Bismuth Player';

    init_audio_system();
    init_ui();

    init_keybindings();

    logger.info('main initialization finished!\n');
}

(function main() {
    logger.info('hello from main()!');

    init();
})();