import logger from '../util/logger.js';
import { EventEmitter } from 'node:events';
import { StreamAudioContext } from '@descript/web-audio-js';
import Speaker from 'speaker';

import Track from '../tracks/Track.js';
import Playlist from '../tracks/Playlist.js';

export default class AudioSystem extends EventEmitter {
    context = null;
    sourceNode = null;
    gainNode = null;
    speaker = null;

    // context (sourceNode -> gainNode) ->
    // -> speaker (destination)

    currentTrack = new Track();
    currentPlaylist = new Playlist();

    playbackStartTime = 0;
    playbackOffset = 0;

    isPlaying = false;

    // In seconds, not position in playlist.
    currentPosition = 0;

    // Between 0 and 1.0.
    volume = 0.5;

    // none, playlist, track
    repeatType = 'none';


    log(message, ...args) {
        logger.info(`[AUDIO] ${message}`, ...args);
    }


    changeRepeatType() {
        if (this.repeatType === 'none') {
            this.repeatType = 'playlist';
        } else if (this.repeatType === 'playlist') {
            this.repeatType = 'track';
        } else if (this.repeatType === 'track') {
            this.repeatType = 'none';
        }

        this.emit('repeat-type-changed', this.repeatType);
    }


    init() {
        try {
            this.context = new StreamAudioContext();

            this.gainNode = this.context.createGain();
            this.gainNode.connect(this.context.destination);

            this.setVolume(this.volume);

            this.emit('initialized');
        } catch (error) {
            this.log('Failed to initialize audio system:', error);
            throw error;
        }
    }


    reset() {
        // Clean up source node.
        if (this.sourceNode) {
            try {
                this.sourceNode.onended = null;
                this.sourceNode.stop();
            } catch (error) {
                // Source may already be stopped.
            }

            this.sourceNode = null;
        }

        // Clean up speaker.
        if (this.speaker) {
            try {
                this.speaker.end();
            } catch (error) {
                this.log('Error ending speaker:', error);
            }

            this.speaker = null;
        }

        // Clean up audio context.
        if (
            this.context &&
            this.context.state !== 'closed'
        ) {
            try {
                this.context.close().catch(() => {});
            } catch (error) {
                this.log('Error closing audio context:', error);
            }
        }

        // Recreate audio context.
        try {
            this.context = new StreamAudioContext();

            this.gainNode = this.context.createGain();
            this.gainNode.connect(this.context.destination);

            this.setVolume(this.volume);
        } catch (error) {
            this.log('Failed to recreate audio context:', error);
            throw error;
        }

        this.isPlaying = false;
        this.playbackStartTime = 0;
        this.playbackOffset = 0;
        this.currentPosition = 0;

        this.emit('reset');
    }


    createSpeaker() {
        if (!this.currentTrack?.audio_buffer) {
            this.log(
                'Cannot create speaker: no audio buffer available'
            );
            return;
        }

        // Clean up existing speaker.
        if (this.speaker) {
            try {
                this.speaker.end();
            } catch (error) {
                this.log('Error ending speaker:', error);
            }

            this.speaker = null;
        }

        const channels =
            this.currentTrack.audio_buffer.numberOfChannels || 2;

        const sampleRate =
            this.currentTrack.audio_buffer.sampleRate || 44100;

        try {
            this.speaker = new Speaker({
                channels: Math.min(channels, 2),
                sampleRate,
                bitDepth: 16,
            });

            this.context.pipe(this.speaker);

            this.log(
                `Speaker created: ${channels}ch, ${sampleRate}Hz`
            );
        } catch (error) {
            this.log('Failed to create speaker:', error);
            throw error;
        }
    }


    setVolume(volume) {
        this.volume = Math.max(
            0,
            Math.min(1, volume)
        );

        if (this.gainNode) {
            this.gainNode.gain.value = this.volume;
        }

        this.emit('volume-changed', this.volume);
    }

        handleTrackEnd() {
        if (!this.currentTrack?.loaded) {
            return;
        }

        if (this.repeatType === 'track') {
            this.rewindTo(0);
            return;
        }

        if (
            this.repeatType === 'playlist' &&
            this.currentPlaylist
        ) {
            // TODO: Implement playlist navigation.
            this.log(
                'Playlist repeat enabled - implement next track logic'
            );
            return;
        }

        if (this.isPlaying) {
            this.currentPosition = this.currentTrack.duration;

            try {
                this.context.suspend();
            } catch (error) {
                this.log(
                    'Error suspending audio context:',
                    error
                );
            }

            this.isPlaying = false;

            this.emit('ended');
        }
    }


    playFrom(position) {
        if (
            !this.currentTrack?.loaded ||
            !this.currentTrack.audio_buffer
        ) {
            this.log(
                'Cannot play: no track loaded or invalid audio buffer'
            );
            return;
        }

        if (!this.context || !this.gainNode) {
            this.log('Cannot play: audio system is not initialized');
            return;
        }

        // Stop and clean up previous source node.
        if (this.sourceNode) {
            try {
                this.sourceNode.onended = null;
                this.sourceNode.stop();
            } catch (error) {
                // Source may already be stopped.
            }

            this.sourceNode = null;
        }

        try {
            this.sourceNode =
                this.context.createBufferSource();

            this.sourceNode.buffer =
                this.currentTrack.audio_buffer;

            this.sourceNode.connect(this.gainNode);

            this.sourceNode.onended = () => {
                this.handleTrackEnd();
            };

            this.playbackStartTime =
                this.context.currentTime;

            this.playbackOffset = position;

            this.sourceNode.start(0, position);

            if (this.context.state === 'suspended') {
                this.context.resume();
            }

            this.isPlaying = true;
            this.currentPosition = position;

            this.log(
                `Playback started at ${position.toFixed(2)}s`
            );

            this.emit('play', {
                track: this.currentTrack,
                position,
            });
        } catch (error) {
            this.log('Error starting playback:', error);

            this.isPlaying = false;

            this.emit('error', error);
        }
    }


    getCurrentPosition() {
        if (
            !this.isPlaying ||
            !this.currentTrack?.loaded
        ) {
            return this.currentPosition;
        }

        try {
            const elapsed =
                this.context.currentTime -
                this.playbackStartTime;

            const position =
                this.playbackOffset + elapsed;

            if (
                position >=
                this.currentTrack.duration
            ) {
                return this.currentTrack.duration;
            }

            this.currentPosition = position;

            return position;
        } catch (error) {
            this.log(
                'Error getting current position:',
                error
            );

            return this.currentPosition;
        }
    }


    playPause() {
        if (!this.currentTrack?.loaded) {
            this.log('Cannot play/pause: no track loaded');
            return;
        }

        if (this.isPlaying) {
            this.currentPosition =
                this.getCurrentPosition();

            try {
                if (this.sourceNode) {
                    this.sourceNode.onended = null;
                    this.sourceNode.stop();
                }

                this.context.suspend();
            } catch (error) {
                this.log(
                    'Error pausing playback:',
                    error
                );
            }

            this.sourceNode = null;
            this.isPlaying = false;

            this.log('Playback paused');

            this.emit('pause', {
                track: this.currentTrack,
                position: this.currentPosition,
            });

            return;
        }

        // If at the end of the track,
        // restart from the beginning.
        if (
            this.currentPosition >=
            this.currentTrack.duration
        ) {
            this.currentPosition = 0;
        }

        this.playFrom(this.currentPosition);
    }


    updateCurrentPosition() {
        if (!this.currentTrack?.loaded) {
            return 0;
        }

        const position =
            this.getCurrentPosition();

        if (
            position >= this.currentTrack.duration &&
            this.isPlaying
        ) {
            this.handleTrackEnd();
        }

        return position;
    }


    rewindTo(position) {
        if (!this.currentTrack?.loaded) {
            this.log('Cannot rewind: no track loaded');
            return;
        }

        const newPosition = Math.max(
            0,
            Math.min(
                position,
                this.currentTrack.duration
            )
        );

        // Avoid micro-rewinds.
        if (
            Math.abs(
                newPosition - this.currentPosition
            ) < 0.1
        ) {
            return;
        }

        if (this.isPlaying) {
            this.playFrom(newPosition);
        } else {
            this.currentPosition = newPosition;

            this.emit('position-changed', {
                position: newPosition,
            });
        }

        this.log(
            `Rewound to ${newPosition.toFixed(2)}s`
        );
    }


    loadAndPlayTrack(track) {
        if (!track || !track.audio_buffer) {
            this.log(
                'Invalid track provided to loadAndPlayTrack'
            );
            return;
        }

        this.reset();

        this.currentTrack = track;

        this.createSpeaker();

        this.currentPosition = 0;

        this.playFrom(0);

        this.emit('track-changed', track);

        this.log(
            `Now playing: ${track.title}`
        );
    }


    nextTrack() {
        if (
            !this.currentPlaylist ||
            this.currentPlaylist.length === 0
        ) {
            this.log('No playlist available');
            return;
        }

        // TODO: Implement actual playlist navigation.
        this.log('Next track: not implemented');
    }


    previousTrack() {
        if (
            !this.currentPlaylist ||
            this.currentPlaylist.length === 0
        ) {
            this.log('No playlist available');
            return;
        }

        // TODO: Implement actual playlist navigation.
        this.log('Previous track: not implemented');
    }
}