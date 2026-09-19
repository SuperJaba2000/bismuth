import blessed from 'reblessed';
import logger from '../../util/logger.js';
import { clamp, screenSize } from '../../util/util.js';
import UITab from './UITab.js';

// old old code
// export function update_playlist() {
//     tab_files_playlist.clearItems();
//     for (const track of current_playlist.tracks) {
//         tab_files_playlist.add(_track_content(track));
//     }
// }

export default class FilesTab extends UITab {
    name = 'files';

    separatorY = 1;
    separatorActive = false;

    init(styles) { 
        logger.debug('[FilesTab] Initializing...');

        const separator = blessed.line(styles['tab1-separator']);
        const playlist =  blessed.list(styles['tab1-playlist']);
        const playlistHeader = blessed.box(styles['tab1-playlist-header']);

        this.separatorY = styles['tab1-separator'].top;

        const fileManager = blessed.filemanager(styles['tab1-filemanager']);

        fileManager.on('file', async path => {
            this.emit('message', 'Loading file...', 0);
            
            // process track with audio system
            // const track = new Track(file_path);
            // await track.load();
            // load_and_play_track(track);
        });

        fileManager.refresh(process.cwd(), () => {
            if(this.active) {
                fileManager.focus();
            }
        });

        this.addChild('separator', separator);
        this.addChild('playlist', playlist);
        this.addChild('playlist-header', playlistHeader);
        this.addChild('filemanager', fileManager);

        logger.debug('[FilesTab] initialized');
    }

    appendTo(screen) {
        super.appendTo(screen);

        // TODO get colors from styles
        screen.on('mouse', e => {
            if(!this.active) return;

            const s = this.children['separator'];
            const eventOnSeparator = (e.x === s.aleft && (e.y >= s.top && e.y < s.top + s.height));

            if(e.action === 'mousedown' && e.button === 'left') {
                if(eventOnSeparator){
                    if(!this.separatorActive) {
                        s.style.fg = 'white';
                        this.separatorActive = true;
                    }

                    this.resize();
                    this.emit('needs-rerender');
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

    resize() {
        const s = this.children['separator'];
        const p = this.children['playlist'];
        const ph = this.children['playlist-header'];
        const fm = this.children['filemanager'];

        s.left = clamp(s.left, 23, screenSize().width - 20);
        s.top = this.separatorY;

        p.width = s.left - 2;
        ph.width = p.width;
        fm.left = s.left + 2;
        fm.width = screenSize().width - s.left - 3;
    }

    prerender() {
        this.resize();
    }
}