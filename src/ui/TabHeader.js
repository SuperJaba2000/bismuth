import blessed from 'reblessed';
import { EventEmitter } from 'node:events';

const SLIDE_FRAMES = 3;
const PAUSE_FRAMES = 6;
const MS_PER_FRAME = 150;

export default class TabHeader extends EventEmitter {
    box;

    init(styles) {
        this.box = blessed.box(styles['tab-header']);
    }

    append(screen) {
        screen.append(this.box);
    }

    generateContent(tabName) {
        return `switch to tab: ${tabName}`;
    }

    changeTab(newTab) {
        this.box.setContent(this.generateContent(newTab.name));
        this.show();
    }

    show() {
        this.box.top = -3;
        this.box.show();
        this.animationFrame = 0;
        clearInterval(this.animationInterval);

        this.animationInterval = setInterval(() => {
            if (this.animationFrame < SLIDE_FRAMES) {
                // slide down
                this.box.top += 1;
                this.emit('needs-rerender');
            } else if(this.animationFrame <= SLIDE_FRAMES + PAUSE_FRAMES) {
                // show
            } else {
                clearInterval(this.animationInterval);
                this.hide();
            }

            this.animationFrame += 1;
        }, MS_PER_FRAME);
    }

    hide() {
        // this.box.top = 0;
        this.animationFrame = 0;
        clearInterval(this.animationInterval);

        this.animationInterval = setInterval(() => {
            if (this.animationFrame < SLIDE_FRAMES) {
                this.box.top -= 1;
                this.emit('needs-rerender');
            } else {
                this.box.hide();
                this.emit('needs-rerender');
                clearInterval(this.animationInterval);
            }

            this.animationFrame += 1;
        }, MS_PER_FRAME);
    }
}