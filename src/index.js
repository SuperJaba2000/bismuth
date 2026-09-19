import logger from './util/logger.js';
import blessed from 'reblessed';
import { initImportantKeybindings, initKeybindings } from './util/keybindings.js';
import UIManager from './ui/UIManager.js';
import AudioSystem from './audio/AudioSystem.js';

const DEBUG = true;


export const screen = blessed.screen({
    smartCSR: true,
    terminal: 'xterm-256color',
    title: 'Bismuth Player',
    //fullUnicode: true
});

export const ui = new UIManager(screen);
export const as = new AudioSystem();

initImportantKeybindings(screen);

function init() {
    logger.info('starting the main initialization...');

    process.title = 'Bismuth Player';

    ui.init();
    ui.appendToScreen();

    initKeybindings();

    logger.info('main initialization finished!\n');
}

(function main() {
    logger.info('hello from main()!');

    init();
})();