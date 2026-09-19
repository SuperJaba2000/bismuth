import blessed from "reblessed";
import UIElement from "../UIElement.js";

export default class CentralButtons extends UIElement {
    // TODO custom chars and colors from styles
    activeColor;
    inactiveColor;

    active = true;
    
    init(styles) {
        

        this.buttonPlay = blessed.box(styles['button-play']);
        this.buttonPrev = blessed.box(styles['button-prev']);
        this.buttonNext = blessed.box(styles['button-next']);
    
        this.buttonPlay.on('click', () => this.emit('play-pause'));
        this.buttonPrev.on('click', () => this.emit('previous-track'));
        this.buttonNext.on('click', () => this.emit('next-track'));
    }

    get buttonPlayContent() {
        if(this.active) {
            return '{green-fg}(={green-fg})';
        }
    }

    get buttonPrevContent() {

    }
    
    get buttonNextContent() {

    }

    update() {

    }

    appendTo(playerBox) {
        playerBox.append(this.buttonPlay);
        playerBox.append(this.buttonPrev);
        playerBox.append(this.buttonNext);
    }
}