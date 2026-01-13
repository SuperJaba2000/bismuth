import blessed from 'reblessed';
import { screen } from '../index.js';
import { ui_options } from '../ui.js';
import { generate_logo, logo_height, logo_width } from './logo.js';


let tab_welcome_logo;
let tab_welcome_separator;
let tab_welcome_hotkeys;

export function init_tab_welcome() {
    tab_welcome_logo = blessed.box({
        ...ui_options['tab_welcome_logo'],
        content: generate_logo()
    });

    tab_welcome_separator = blessed.box({
        ...ui_options['tab_welcome_separator'],
        top: ui_options['tab_welcome_logo'].top + logo_height,
        content: '~'.repeat(logo_width + 6)
    });

    tab_welcome_hotkeys = blessed.box({
        ...ui_options['tab_welcome_hotkeys'],
        top: ui_options['tab_welcome_logo'].top + logo_height + 2,
        height: "100%-" + String((ui_options['tab_welcome_logo'].top + logo_height + 4)),
    });

    screen.append(tab_welcome_logo);
    screen.append(tab_welcome_separator);
    screen.append(tab_welcome_hotkeys);

    screen.render();
}

// deprecated
export function resize_logo() {
    tab_welcome_logo.setContent(generate_logo());
}

export function show_tab_welcome() {
    tab_welcome_logo.show();
    tab_welcome_separator.show();
    tab_welcome_hotkeys.show();

    screen.render();
}

export function hide_tab_welcome() {
    tab_welcome_logo.hide();
    tab_welcome_separator.hide();
    tab_welcome_hotkeys.hide();

    screen.render();
}