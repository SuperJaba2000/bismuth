import blessed from 'reblessed';
import { clamp, screenSize } from '../../util/util.js';
import UITab from '../UITab.js';

// old old code
// export function update_playlist() {
//     tab_files_playlist.clearItems();
//     for (const track of current_playlist.tracks) {
//         tab_files_playlist.add(_track_content(track));
//     }
// }

export default class FilesTab extends UITab {
    name = 'files';
    elements = {};

    separatorY = 1;
    separatorActive = false;

    init(styles) {
        this.elements['separator'] = blessed.line(styles['tab1-separator']);
        this.elements['playlist'] = blessed.list(styles['tab1-playlist']);
        this.elements['playlist-header'] = blessed.box(styles['tab1-playlist-header']);

        this.separatorY = styles['tab1-separator'].top;

        const fm = blessed.filemanager(styles['tab1-filemanager']);

        fm.on('file', async path => {
            this.emit('message', 'Loading file...', 0);
            
            // process track with audio system
            // const track = new Track(file_path);
            // await track.load();
            // load_and_play_track(track);
        });

        fm.refresh(process.cwd(), () => {
            if(this.active) {
                fm.focus();
            }
        });

        this.elements['filemanager'] = fm;
    }

    append(screen) {
        super.append(screen);

        // TODO get colors from styles
        screen.on('mouse', e => {
            if(!this.active) return;

            const s = this.elements['separator'];
            const eventOnSeparator = (e.x === s.aleft && (e.y >= s.top && e.y < s.top + s.height));

            if(e.action === 'mousedown' && e.button === 'left') {
                if(eventOnSeparator){
                    if(!this.separatorActive) {
                        s.style.fg = 'white';
                        this.separatorActive = true;
                        this.emit('needs-rerender');
                    }
                }
            } else if(e.action === 'mouseup' && e.button === 'left') {
                if(this.separatorActive) {
                    s.style.fg = 'gray';
                    this.separatorActive = false;
                    this.emit('needs-rerender');
                }
            }
        });
    }

    prerender() {
        //if (active_tab !== 'files') return;
        const s = this.elements['separator'];
        const p = this.elements['playlist'];
        const ph = this.elements['playlist-header'];

        s.left = clamp(s.left, 23, screenSize().width - 20);
        s.top = this.separatorY;

        p.width = s.left - 3;
        ph.width = p.width;
        // tab_files_filemanager.left = tab_files_separator.left + 3;

        // tab_files_playlist.width = tab_files_separator.left - 3;
        // tab_files_playlist_header.width = tab_files_playlist.width;
    }
}