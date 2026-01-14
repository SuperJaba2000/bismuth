import blessed from 'reblessed';
import { screen } from '../../index.js';
import { ui_options } from '../../ui.js';
import { current_position, track_info, track_loaded } from '../../audio/audio-system.js';

export let track_time, track_title, track_artist;

// TODO : calc dinamically
const track_title_max_length = () => 30;
const track_artist_max_length = () => 30;

const _track_position_content = () => {
    const minutes = Math.floor(current_position / 60);
    const seconds = Math.floor(current_position % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
};
const _track_duration_content = () => {
    const duration = track_info?.duration || 0;
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
};
const _track_time_content = () => track_loaded ? `${_track_position_content()}|${_track_duration_content()}` : `00:00|00:00`;

const _track_title_content = () => track_loaded ? track_info.title : 'Track not loaded';
const _track_artist_content = () => track_loaded ? '- ' + track_info.artist : '';


export function init_track_info() {
    track_time = blessed.box(ui_options['track_time']);
    track_title = blessed.box(ui_options['track_title']);
    track_artist = blessed.box(ui_options['track_artist']);

    update_track_info();
}

function update_track_title() {
    const title = _track_title_content();
    track_title.setContent(title);
    track_title.width = Math.min(title.length, track_title_max_length());
}

function update_track_artist() {
    const artist = _track_artist_content();
    track_artist.setContent(artist);
    track_artist.width = Math.min(artist.length, track_artist_max_length());
    //track_artist.left = track_title.left + track_title.width;
}

export function update_track_info() {
    track_time.setContent(_track_time_content());
    
    update_track_title();
    update_track_artist();

    screen.render();
}