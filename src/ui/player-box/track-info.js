import blessed from 'reblessed';
import { screen } from '../../index.js';
import { ui_options } from '../../ui.js';
import { current_track, current_position } from '../../audio/audio-system.js';
import { get_screen_size } from '../../util.js';

export let track_time, track_title, track_artist;

// TODO : calc dinamically
const track_title_max_length = () => Math.floor(get_screen_size().width / 4);
const track_artist_max_length = () => Math.floor(get_screen_size().width / 2 - 14) - track_title.width;

const _track_position_content = () => {
    const minutes = Math.floor(current_position / 60);
    const seconds = Math.floor(current_position % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
};
const _track_duration_content = () => {
    const duration = current_track.duration || 0;
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
};
const _track_time_content = () => current_track.loaded ? `${_track_position_content()}|${_track_duration_content()}` : `00:00|00:00`;

const _track_title_content = () => {
    let calculated_title = current_track.title;

    if(calculated_title.length < track_title_max_length())
        return calculated_title;

    return calculated_title.slice(0, track_title_max_length() - 3) + '...';
};
const _track_artist_content = () => {
    let calculated_artist = '- ' + current_track.artist;

    if(calculated_artist.length < track_artist_max_length())
        return calculated_artist;

    return calculated_artist.slice(0, track_artist_max_length() - 3) + '...';
};


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
    track_artist.left = ui_options['track_title'].left + track_title.width + 1;
}

export function update_track_info() {
    track_time.setContent(_track_time_content());
    
    update_track_title();
    update_track_artist();

    screen.render();
}