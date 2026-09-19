import blessed from 'reblessed';
import { screen } from '../../index.js';
import { ui_options } from '../ui.js';
import { repeat_type, change_repeat_type } from '../../audio/audio-system.js';

export let button_repeat_type;

const _button_repeat_type_content = () => {
    if(repeat_type === 'none') {
        return `{${ui_options['fg_color_inactive']}-fg}[ - ]`;
    }else if(repeat_type === 'playlist') {
        return `{${ui_options['button_repeat_type_fg']}-fg}[ p ]`;
    }else{
        return `{${ui_options['button_repeat_type_fg']}-fg}[ 1 ]`;
    }
}

export function clear_play_time_update() {
    clearInterval(play_time_update_interval);
}

export function init_right_buttons() {
    button_repeat_type = blessed.box(ui_options['button_repeat_type']);

    button_repeat_type.on('click', () => {
        change_repeat_type();
    })
}

export function update_right_buttons() {
    button_repeat_type.setContent(_button_repeat_type_content());
    screen.render();
}