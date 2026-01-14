import logger from './logger.js';
import blessed from 'reblessed';
import { init_ui, show_message } from './ui.js';
import { init_audio_system, reset_audio_system } from './audio/audio-system.js';

// TODO: move to config
const DEBUG = true;


export const screen = blessed.screen({
    smartCSR: true,
    terminal: 'xterm-256color',
    title: 'Bismuth Player',
    //fullUnicode: true
});
logger.info('screen created');


screen.key(['q', 'C-c'], () => {
    return process.exit(0);
});

// deprecated: welcome logo is now aligned to the center
// screen.on('resize', () => {
//     if(active_tab === 'welcome')
//         init_tab_welcome();
// });


function init() {
    logger.info('starting the main initialization...');

    // set window title
    process.title = 'Bismuth Player';

    init_audio_system();
    init_ui();

    // debug function
    screen.key(['r'], () => {
        if(!DEBUG) return;

        init_ui();

        logger.info('ui reloaded by hotkey');
        show_message('Player reloaded!', 1);
    });

    // debug function
    screen.key(['a'], () => {
        if(!DEBUG) return;

        reset_audio_system();

        logger.info('audio system reloaded by hotkey');
        show_message('Audio system reloaded!', 1);
    })

    logger.info('main initialization finished!\n');
}


(function main() {
    logger.info('hello from main()!');

    init();
})();