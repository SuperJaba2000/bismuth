import blessed from 'reblessed';
import { screen } from '../../index.js';
import { ui_options } from '../ui.js';
import { hide_tab_files, show_tab_files } from './tab-files.js';
import { hide_player_box, show_player_box } from '../player-box/player-box.js';
import { hide_tab_welcome, show_tab_welcome } from './tab-welcome.js';


export let active_tab = 'welcome';

export let tab_header;

// flag to prevent double initialization of key handler
let key_handler_started = false;

const _tab_display_name = () => active_tab == 'files' ? 'Files' : (active_tab == 'yandex' ? 'Yandex' : 'Config');
const _tab_header_content = () => `switch to tab: ${_tab_display_name()}`;


export function show_active_tab() {
    if (active_tab === 'welcome') {
        hide_tab_files();
        hide_player_box();
        show_tab_welcome();
    } else if (active_tab === 'files') {
        hide_tab_welcome();
        //hide_tab_config();
        //hide_tab_yandex();

        show_tab_files();
        show_player_box();
    } else if (active_tab === 'yandex') {
        hide_tab_welcome();
        //hide_tab_config();
        hide_tab_files();

        //show_tab_yandex();
        show_player_box();
    } else if (active_tab === 'config') {
        hide_tab_welcome();
        hide_tab_files();
        //hide_tab_yandex();

        //show_tab_config();
        hide_player_box();
    }
}

let animation_frame = 0;
let animation_interval;
let animation_timeout;

export function show_tab_header() {
    tab_header.top = -3;
    animation_frame = 0;
    clearTimeout(animation_timeout);
    clearInterval(animation_interval);

    animation_interval = setInterval(() => {
        if (animation_frame >= 2 || tab_header.top >= 0) {
            clearInterval(animation_interval);
            animation_timeout = setTimeout(() => {
                hide_tab_header();
            }, 1000)
            return;
        }

        tab_header.top += 1;
        screen.render();

        animation_frame++;
    }, 150);
}

function hide_tab_header() {
    animation_frame = 0;
    clearTimeout(animation_timeout);
    clearInterval(animation_interval);

    animation_interval = setInterval(() => {
        if (animation_frame >= 2 || tab_header.top <= -3) {
            clearInterval(animation_interval);
            return;
        }

        tab_header.top -= 1;
        screen.render();

        animation_frame++;
    }, 120);
}


export function init_tab_header() {
    tab_header = blessed.box(ui_options['tab_header']);
    tab_header.setContent(_tab_header_content());

    screen.append(tab_header);

    function change_tab(tab) {
        active_tab = tab;
        tab_header.setContent(_tab_header_content());
        show_tab_header();
        screen.render();
    }

    if (key_handler_started)
        return;

    screen.key(['tab'], () => {
        if (active_tab === 'welcome') {
            change_tab('files');
        } else if (active_tab === 'config') {
            change_tab('files');
        } else if (active_tab === 'files') {
            change_tab('yandex');
        } else if (active_tab === 'yandex') {
            change_tab('config');
        }

        show_active_tab();
    });

    key_handler_started = true;
}