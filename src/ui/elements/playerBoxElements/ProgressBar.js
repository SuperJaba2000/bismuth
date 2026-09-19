import blessed from 'reblessed';
import { EventEmitter } from 'node:events';

export default class ProgressBar extends EventEmitter {
    percent = 0;

    activeChar;
    inactiveChar;
    activeColor;
    inactiveColor;

    init(styles) {
        this.bar = blessed.box(styles['progress-bar-box']);

        this.activeChar = styles['progress-bar-char1'] || '-';
        this.inactiveChar = styles['progress-bar-char0'] || '-';
        this.activeColor = styles['progress-bar-color1'];
        this.inactiveColor = styles['progress-bar-color0'];
    }

    appendTo(playerBox) {
        playerBox.append(this.bar);
    }

    update() {
        const activeLength = Math.floor(this.percent / 100 * this.bar.width);
        const inactiveLength = this.bar.width - activeLength;
        this.bar.content = '\n' + // for heigth = 2 (larger area to click)
            `{${this.activeColor}-fg}${this.activeChar.repeat(activeLength)}` + 
            `{${this.inactiveColor}-fg}${this.inactiveChar.repeat(inactiveLength)}`;
        this.emit('needs-rerender');
    }

    setPercent(percent) {
        this.percent = percent;
        this.update();
    }
}