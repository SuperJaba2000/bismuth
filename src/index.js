import blessed from 'reblessed';
import { init_ui, show_message, ui_options } from './ui.js';
import { init_audio_system, reset_audio_system } from './audio/audio_system.js';


export const screen = blessed.screen({
    smartCSR: true,
    terminal: 'xterm-256color',
    //fullUnicode: true
});

screen.key(['q', 'C-c'], () => {
    return process.exit(0);
});


function init() {
    // TODO : fix process title
    process.title = 'Serenity Player';

    init_audio_system();
    init_ui();

    screen.key(['r'], () => {
        init_ui();

        show_message('Player reloaded!', 1);
    });

    screen.key(['a'], () => {
        reset_audio_system();

        show_message('Audio system reloaded!', 1);
    })
}


(function main() {
    init();
})();