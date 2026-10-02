import logger from '../util/logger.js';
import { EventEmitter } from 'node:events';
import { StreamAudioContext } from '@descript/web-audio-js';
import Speaker from 'speaker';
import { state, fire } from '../app.js';

export default class AudioSystem extends EventEmitter {
    context = null;
    sourceNode = null;
    gainNode = null;
    speaker = null;

    get currentTrack() { return state.get("current-track"); }
    get currentPlaylist() { return state.get("current-playlist"); }

    changeRepeatType() {
        switch (state.get('repeat-type')) {
            case 'none':
                state.set('repeat-type', 'playlist');
                break;

            case 'playlist':
                state.set('repeat-type', 'track');
                break;

            case 'track':
                state.set('repeat-type', 'none');
                break;
        }
    }

    init() {
        try {
            logger.info('started AudioSystem.init()')

            this.context = new StreamAudioContext();

            this.gainNode = this.context.createGain();
            this.gainNode.connect(this.context.destination);

            this.updateVolume();
            state.on("change:volume", () => this.updateVolume());

            loffer.info('AudioSystem.init() finished');
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
                logger.error('Error stopping sourceNode:', error);
            }

            this.sourceNode = null;
        }

        // Clean up speaker.
        if (this.speaker) {
            try {
                this.speaker.end();
            } catch (error) {
                logger.error('Error ending speaker:', error);
            }

            this.speaker = null;
        }

        // Clean up audio context.
        if (
            this.context &&
            this.context.state !== 'closed'
        ) {
            try {
                this.context.close().catch(() => { });
            } catch (error) {
                logger.error('Error closing audio context:', error);
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

        state.set('playback-state', 'paused');
        state.set('current-position', 0);
        this.playbackStartTime = 0;
        this.playbackOffset = 0;
    }


    createSpeaker() {
        if (!this.currentTrack?.audioBuffer) {
            logger.error('Cannot create speaker: no audio buffer available');
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

        const channels = this.currentTrack.audioBuffer.numberOfChannels || 2;
        const sampleRate = this.currentTrack.audioBuffer.sampleRate || 44100;

        try {
            this.speaker = new Speaker({
                channels: Math.min(channels, 2),
                sampleRate,
                bitDepth: 16,
            });

            this.context.pipe(this.speaker);

            logger.debug(`Speaker created: ${channels}ch, ${sampleRate}Hz`);
        } catch (error) {
            logger.error('Failed to create speaker:', error);
            throw error;
        }
    }


    updateVolume() {
        const clampedVolume = Math.max(0, Math.min(1, state.get('volume')));
        if (state.get('volume') != clampedVolume) {
            return state.set('volume', clampedVolume);
        }

        if (this.gainNode) {
            this.gainNode.gain.value = clampedVolume;
        }
    }

    handleTrackEnd() {
        if (!this.currentTrack?.loaded) {
            return;
        }

        fire('track-ended');

        if (this.repeatType === 'track') {
            this.rewindTo(0);
            return;
        }

        if (
            this.repeatType === 'playlist' &&
            this.currentPlaylist
        ) {
            // TODO: Implement playlist navigation.
            logger.info('Playlist repeat enabled, but playlist navgation logic isnt implemented');
            return;
        }

        if (state.get('playback-state') == 'playing') {
            state.set('current-position', state.get('current-track').duration);

            try {
                this.context.suspend();
            } catch (error) {
                logger.error('Error suspending audio context:', error);
            }

            state.set('playback-state', 'paused');
        }
    }


    playFrom(position) {
        if (
            !this.currentTrack?.loaded ||
            !this.currentTrack.audioBuffer
        ) {
            logger.error('Cannot play: no track loaded or invalid audio buffer');
            return;
        }

        if (!this.context || !this.gainNode) {
            logger.error('Cannot play: audio system is not initialized');
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
            this.sourceNode = this.context.createBufferSource();
            this.sourceNode.buffer = state.get('current-track').audioBuffer;
            this.sourceNode.connect(this.gainNode);
            this.sourceNode.onended = () => {
                this.handleTrackEnd();
            };

            this.playbackStartTime = this.context.currentTime;

            this.playbackOffset = position;

            this.sourceNode.start(0, position);

            if (this.context.state === 'suspended') {
                this.context.resume();
            }

            this.isPlaying = true;
            this.currentPosition = position;

            logger.debug(`Playback started at ${position.toFixed(2)}s`);

            // fire(...)
        } catch (error) {
            logger.error('Error starting playback:', error);

            state.set('playback-state', 'paused');
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
        if (!track || !track.audioBuffer) {
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