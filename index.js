import blessed from 'reblessed';
import { init_ui } from './ui.js';

const screen = blessed.screen({
    smartCSR: true,
    terminal: 'xterm-256color',
    //fullUnicode: true
});

function init() {
    // TODO : fix process title
    process.title = 'Yandex Music CLI';

    init_ui(screen);

    screen.key(['escape', 'q', 'C-c'], () => {
        return process.exit(0);
    });

    screen.key(['r'], () => {
        init_ui(screen);
    });
}


(function main() {
    init();
})();