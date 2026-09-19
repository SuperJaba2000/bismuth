export default class Track{
    path = null;
    metadata = {};
    audioBuffer = null;

    constructor(path) {
        this.path = path;
    }

    get loaded() {
        return this.audio_buffer !== null;
    }

    get title() {
        return this.loaded ? this.metadata.title : 'Track not loaded';
    }

    get artist() {
        return this.loaded ? this.metadata.artist : 'Unknown';
    }

    get duration() {
        return this.loaded ? (this.metadata.duration || this.audio_buffer.duration || 3599 /* -> 59:59 */) : 0;
    }

    async load() {
        // ...
    }
}