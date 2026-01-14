import logger from '../logger.js';
import { clamp } from '../util.js';
import Speaker from 'speaker';
import { StreamAudioContext } from '@descript/web-audio-js';
import { show_message } from '../ui.js';
import { update_player_box } from '../ui/player-box/player-box.js';

import Track from '../tracks/Track.js';
import Playlist from '../tracks/Playlist.js';


function log(message, ...args) {
    logger.info(`[AUDIO] ${message}`, ...args);
}


export let audio_context, source_node, gain_node, speaker;

export let current_track = new Track();
export let current_playlist = new Playlist();


let playback_start_time = 0;
let playback_offset = 0;

export let is_playing = false;

// in seconds not position in playlist
export let current_position = 0;
// between 0 and 1.0
export let volume = 0.5;


// none, playlist, track
export let repeat_type = 'none';

export function change_repeat_type() {
    if(repeat_type == 'none') {
        repeat_type = 'playlist';
    } else if(repeat_type == 'playlist') {
        repeat_type = 'track';
    } else if(repeat_type == 'track') {
        repeat_type = 'none';
    }

    update_player_box();
}


// simplified initialization (for the first time only)
export function init_audio_system() {
    try{
        audio_context = new StreamAudioContext();
        gain_node = audio_context.createGain();
        gain_node.connect(audio_context.destination);
        set_volume(volume);
    } catch(error) {
        show_message('Failed to initialize audio context!', 1);
        log('Failed to initialize audio context: ', error);
    }
}

// deleting everything that could refer to the previous track
export function reset_audio_system() {
    // Clean up source node
    if (source_node) {
        try {
            source_node.onended = null; // Clear event handler
            source_node.stop();
        } catch (e) { }
        source_node = null;
    }

    // Clean up speaker
    if (speaker) {
        speaker.end();
        speaker = null;
    }

    // Clean up audio context
    if (audio_context && audio_context.state !== 'closed') {
        try {
            audio_context.close().catch(() => {});
        } catch (e) {
            log('Error closing audio context:', e);
        }
    }
    
    // Reinitialize audio context
    try {
        audio_context = new StreamAudioContext();
        gain_node = audio_context.createGain();
        gain_node.connect(audio_context.destination);
        set_volume(volume); // Restore previous volume
    } catch (error) {
        log('Failed to recreate audio context:', error);
        show_message('Failed to initialize audio system!', 1);
    }

    is_playing = false;
    playback_start_time = 0;
    playback_offset = 0;
    current_position = 0;
}

export function set_volume(new_volume) {
    volume = clamp(new_volume, 0, 1);

    if (gain_node) {
        gain_node.gain.value = volume;
    }
}

function create_speaker() {
    if (!current_track?.audio_buffer) {
        log('Cannot create speaker: no audio buffer available');
        return;
    }

    // Clean up existing speaker
    if (speaker) {
        try {
            speaker.end();
        } catch (e) {
            log('Error ending speaker:', e);
        }
        speaker = null;
    }

    // Get audio properties with safe defaults
    const channels = current_track.audio_buffer.numberOfChannels || 2;
    const sampleRate = current_track.audio_buffer.sampleRate || 44100;

    try {
        speaker = new Speaker({
            channels: Math.min(channels, 2), // Limit to stereo for compatibility
            sampleRate: sampleRate,
            bitDepth: 16, // Standard for PCM output
        });

        audio_context.pipe(speaker);
        log(`Speaker created: ${channels}ch, ${sampleRate}Hz`);
    } catch (error) {
        log('Failed to create speaker:', error);
        show_message('Failed to initialize audio output', 1);
    }
}

function handle_track_end() {
    if (!current_track?.loaded) return;

    if (repeat_type === 'track') {
        // Repeat current track
        rewind_to(0);
        return;
    }

    if (repeat_type === 'playlist' && current_playlist) {
        // Move to next track in playlist
        // TODO: Implement playlist navigation
        log('Playlist repeat enabled - implement next track logic');
        return;
    }

    // No repeat - stop playback
    if (is_playing) {
        current_position = current_track.duration;
        try {
            audio_context.suspend();
        } catch (e) {
            log('Error suspending audio context:', e);
        }
        is_playing = false;
        update_player_box();
    }
}

function play_from(position) {
    if (!current_track?.loaded || !current_track.audio_buffer) {
        show_message('No track loaded or invalid audio buffer', 1);
        return;
    }

    // Stop and clean up previous source node
    if (source_node) {
        try {
            source_node.onended = null;
            source_node.stop();
        } catch (e) { }
        source_node = null;
    }

    // Create new source node
    try {
        source_node = audio_context.createBufferSource();
        source_node.buffer = current_track.audio_buffer;
        source_node.connect(gain_node);
        
        // Set up end handler
        source_node.onended = () => {
            handle_track_end();
        };

        // Set playback timing
        playback_start_time = audio_context.currentTime;
        playback_offset = position;

        // Start playback
        source_node.start(0, position);

        // Resume context if suspended
        if (audio_context.state === 'suspended') {
            audio_context.resume();
        }

        is_playing = true;
        current_position = position;

        log(`Playback started at ${position.toFixed(2)}s`);
        update_player_box();
    } catch (error) {
        log('Error starting playback:', error);
        show_message('Failed to play audio', 1);
        is_playing = false;
    }
}

function get_current_position() {
    if (!is_playing || !current_track?.loaded) {
        return current_position;
    }

    try {
        const elapsed = audio_context.currentTime - playback_start_time;
        const new_position = playback_offset + elapsed;
        
        // Don't exceed track duration
        if (new_position >= current_track.duration) {
            return current_track.duration;
        }

        current_position = new_position;
        
        return new_position;
    } catch (error) {
        log('Error getting current position:', error);
        return current_position;
    }
}

export function play_pause() {
    if (!current_track?.loaded) {
        show_message('No track loaded', 1);
        return;
    }

    if (is_playing) {
        // Pause playback
        current_position = get_current_position();
        
        try {
            if (source_node) {
                source_node.onended = null;
                source_node.stop();
            }
            audio_context.suspend();
        } catch (e) {
            log('Error pausing playback:', e);
        }
        
        source_node = null;
        is_playing = false;
        log('Playback paused');
    } else {
        // Start or resume playback
        // If at the end of the track, restart from beginning
        if (current_position >= current_track.duration) {
            current_position = 0;
        }
        
        play_from(current_position);
    }
    
    update_player_box();
}

// call from ui update loop
export function update_current_position() {
    if (!current_track?.loaded) return 0;
    
    const position = get_current_position();
    
    // Check if we've reached the end of the track
    if (position >= current_track.duration && is_playing) {
        handle_track_end();
    }
    
    return position;
}

export function rewind_to(position) {
    if (!current_track?.loaded) {
        show_message('No track loaded', 1);
        return;
    }

    const new_position = clamp(position, 0, current_track.duration);
    
    // Avoid micro-rewinds (less than 0.1 second difference)
    if (Math.abs(new_position - current_position) < 0.1) {
        return;
    }
    
    if (is_playing) {
        play_from(new_position);
    } else {
        current_position = new_position;
        update_player_box(); // Update UI even when paused
    }
    
    log(`Rewound to ${new_position.toFixed(2)}s`);
}

export function load_and_play_track(track) {
    if (!track || !track.audio_buffer) {
        log('Invalid track provided to load_and_play_track');
        return;
    }
    
    reset_audio_system();
    current_track = track;
    
    // Create speaker for audio output
    create_speaker();
    
    // Start playback from beginning
    current_position = 0;
    play_from(0);
    
    show_message(`Now playing: ${track.title}`, 1);
    update_player_box();
}

export function next_track() {
    if (!current_playlist || current_playlist.length === 0) {
        show_message('No playlist available', 1);
        return;
    }
    
    // TODO: Implement actual playlist navigation
    
}

export function previous_track() {
    if (!current_playlist || current_playlist.length === 0) {
        show_message('No playlist available', 1);
        return;
    }
    
    // TODO: Implement actual playlist navigation
    
}