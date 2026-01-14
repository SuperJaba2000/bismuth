import { get_track_metadata } from "../audio/audio-metadata";
import { load_wav, load_with_decode } from "../audio/audio-loader";

export default class Track {
    path;

    metadata = {};
    audio_buffer = null;

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
        this.metadata = get_track_metadata(this.path);

        if (this.metadata.ext === '.wav') {
            this.audio_buffer = await load_wav(this.path);
        } else {
            this.audio_buffer = await load_with_decode(this.path);
        }
    }
}