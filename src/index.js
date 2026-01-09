import blessed from 'reblessed';
import { init_ui, show_message, ui_options } from './ui.js';

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

    init_ui();

    screen.key(['r'], () => {
        init_ui();

        show_message('Player reloaded!', 1);
    });
}


(function main() {
    init();
})();