import blessed from 'blessed';
import json5 from 'json5';
import { readFileSync } from 'fs';

// import ui styles from json config
const { player_box_options, 
    button_play_options, 
    play_time_options, 
    track_title_options, 
    track_artist_options } = json5.parse(readFileSync('./ui/player_box.json5', 'utf-8'));


// TODO : fix process title
process.title = 'Yandex Music CLI';

// TODO : move to config file
const FG_COLOR_INACTIVE = '#999999';
const BUTTON_PLAY_BORDER_FG = '#ffffaa';
const BUTTON_PLAY_MAIN_FG = 'yellow';



let center_buttons_active = true;
let is_playing = false;

const _button_play_border_fg = () => center_buttons_active ? BUTTON_PLAY_BORDER_FG : FG_COLOR_INACTIVE;
const _button_play_main_fg = () => center_buttons_active ? BUTTON_PLAY_MAIN_FG : FG_COLOR_INACTIVE;
const _button_play_content = () => `{${_button_play_border_fg()}-fg}({/}{${_button_play_main_fg()}-fg} ${is_playing ? '=' : '▶︎'} {/}{${_button_play_border_fg()}-fg}){/}`;



const screen = blessed.screen({
    smartCSR: true,
    terminal: 'xterm-256color',
    //fullUnicode: true
});


const player_box = blessed.box(player_box_options);

const button_play = blessed.box({
    ...button_play_options,
    content: _button_play_content()
});

// regenerate button play content and rerender screen
function play_pause() {
    is_playing = !is_playing;
    button_play.setContent(_button_play_content());
    screen.render();
}

button_play.on('click', play_pause);
screen.key(['space'], play_pause);

const play_time = blessed.box(play_time_options);
const track_title = blessed.box(track_title_options);
const track_artist = blessed.box(track_artist_options);




player_box.append(button_play);
player_box.append(play_time);
player_box.append(track_title);
player_box.append(track_artist);
screen.append(player_box);

screen.render();



screen.key(['escape', 'q', 'C-c'], function (ch, key) {
    return process.exit(0);
});
