export default class Playlist {
    tracks = [];

    current_position = 0;
    shuffle = false;

    shuffled_tracks = [];

    constructor(tracks = []) {
        this.tracks = tracks;
    }

    get _tracks() {
        return this.shuffle ? this.shuffled_tracks : this.tracks;
    }

    get current_track() {
        return this._tracks[this.current_position];
    }

    get is_last_track() {
        return this.current_position === (this._tracks.length - 1);
    }

    get next_position() {
        return (this.current_position + 1) % this._tracks.length;
    }

    get next_track() {
        return this._tracks[this.next_position];
    }

    get length() {
        return this._tracks.length;
    }

    next() {
        this.current_position = this.next_position;
    }

    shuffle_tracks() {
        // slice() used to clone the array
        this.shuffled_tracks = this.tracks.slice();

        for (let i = this.shuffle_tracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [this.shuffle_tracks[i], this.shuffle_tracks[j]] = [this.shuffle_tracks[j], this.shuffle_tracks[i]];
        }

        return this;
    }

    add(track) {
        this.tracks.push(track);

        /* TODO: add track to shuffle_tracks */

        return this;
    }

    remove_index(index) {
        this.tracks.splice(index, 1);

        return this;
    }

    remove(track) {
        const index = this.tracks.indexOf(track);

        return this.remove_index(index);
    }
}