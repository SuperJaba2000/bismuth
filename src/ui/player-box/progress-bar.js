import blessed from "reblessed";
import { screen } from "../../index.js";
import { ui_options } from "../ui.js";
import { current_track, current_position, rewind_to } from "../../audio/audio-system.js";

export let progress_bar;

const _progress_bar_length = () => process.stdout.columns - 5;
const _progress_bar_content = () => {
    const percentage = current_track.loaded ? (current_position / current_track.duration) : 0;
    const active_length = Math.floor(percentage * _progress_bar_length());
    const inactive_length = _progress_bar_length() - active_length;
    return `\n{${ui_options['progress_bar_fg_active']}-fg}${'-'.repeat(active_length)}{${ui_options['progress_bar_fg_inactive']}-fg}${'-'.repeat(inactive_length)}`;
};


let mouse_down_on_progress_bar = false;

function progress_bar_mouse(data) {
    if (data.action === 'mousedown' && data.button === 'left') {
        mouse_down_on_progress_bar = true;
    } else if (data.action === 'mouseup' && data.button === 'left') {
        if (mouse_down_on_progress_bar) {
            mouse_down_on_progress_bar = false;

            const relative_x = data.x - progress_bar.left;
            const percentage = relative_x / _progress_bar_length();
            const timestamp = Math.floor(percentage * current_track.duration);

            rewind_to(timestamp);
        }
    }
}

export function init_progress_bar() {
    progress_bar = blessed.box(ui_options['progress_bar']);

    progress_bar.on('mouse', data => progress_bar_mouse(data));

    update_progress_bar();
}

export function update_progress_bar() {
    progress_bar.setContent(_progress_bar_content());
    screen.render();
}