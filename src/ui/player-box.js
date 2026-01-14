
// THIS FILE IS DEPRECATED!!!

// ALL ELEMENTS MOVED TO player-box/ FOLDER!


import blessed from 'reblessed';
import { screen } from '../index.js';
import { ui_options } from '../ui.js';
import { is_playing, 
    update_current_position, 
    current_position, 
    repeat_type,
    audio_play_pause, 
    track_loaded, 
    track_info, 
    audio_change_repeat_type,
    rewind_to } from '../audio/audio-system.js';


export let progress_bar, 
    player_box, 
    button_play, 
    button_prev, 
    button_next, 
    play_time, 
    track_title, 
    track_artist,
    button_repeat_type;

// TODO : move to config file
const FG_COLOR_INACTIVE = '#999999';
const BUTTON_PLAY_BORDER_FG = '#ffffaa';
const BUTTON_PLAY_MAIN_FG = 'yellow';
const BUTTONS_PREV_NEXT_FG = 'yellow';
const FG_PROGRESS_BAR_ACTIVE = 'yellow';
const FG_PROGRESS_BAR_INACTIVE = '#ffffaa';




const _button_repeat_type_content = () => repeat_type === 'none' ? '[ - ]' : repeat_type === 'playlist' ? '[ ↻ ]' : '[ ↻1 ]';



let play_time_update_interval;

export function set_play_time_update() {
    play_time_update_interval = setInterval(() => {
        update_current_position();
        progress_bar.setContent(_progress_bar_content());
        play_time.setContent(_play_time_content());
        screen.render();
    }, 100);
}

export function clear_play_time_update() {
    clearInterval(play_time_update_interval);
}

function init_button_repeat_type() {
    button_repeat_type = blessed.box({
        ...ui_options['button_repeat_type'],
        content: _button_repeat_type_content()
    });

    button_repeat_type.on('click', () => {
        audio_change_repeat_type();
    })
}

export function update_repeat_type() {
    button_repeat_type.setContent(_button_repeat_type_content());
    screen.render();
}

export function init_player_box() {
    init_button_repeat_type();

    button_play.on('click', play_pause);
    screen.key(['space'], play_pause);

    button_prev = blessed.box({
        ...ui_options['button_prev'],
        content: _button_prev_content()
    });

    button_next = blessed.box({
        ...ui_options['button_next'],
        content: _button_next_content()
    });

    play_time = blessed.box(ui_options['play_time']);
    track_title = blessed.box(ui_options['track_title']);
    track_artist = blessed.box(ui_options['track_artist']);

    // append order is important! 
    // overlays are possible when the window is reduced!

    
    // low important
    player_box.append(track_title);
    player_box.append(track_artist);

    // medium
    player_box.append(play_time);
    player_box.append(button_repeat_type);

    // very important to show
    player_box.append(button_play);
    player_box.append(button_prev);
    player_box.append(button_next);

    screen.append(player_box);
    screen.append(progress_bar);
}

export function show_player_box() {
    progress_bar.show();
    player_box.show();

    screen.render();
}

export function hide_player_box() {
    progress_bar.hide();
    player_box.hide();

    screen.render();
}
