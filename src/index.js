import logger from './util/logger.js';
import blessed from 'reblessed';
//import { init_audio_system } from './audio/audio-system.js';
import { initImportantKeybindings, initKeybindings } from './util/keybindings.js';
import UIManager from './ui/UIManager.js';

// TODO: move to config
const DEBUG = true;


export const screen = blessed.screen({
    smartCSR: true,
    terminal: 'xterm-256color',
    title: 'Bismuth Player',
    //fullUnicode: true
});

export const ui = new UIManager(screen);

initImportantKeybindings();

function init() {
    logger.info('starting the main initialization...');

    process.title = 'Bismuth Player';

    // init_audio_system();
    ui.init();
    ui.showActive();

    initKeybindings();

    logger.info('main initialization finished!\n');
}

(function main() {
    logger.info('hello from main()!');

    init();
})();