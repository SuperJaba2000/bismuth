import blessed from 'reblessed';
import UIElement from './UIElement.js';
import ProgressBar from './playerBoxElements/ProgressBar.js';
import CentralButtons from './playerBoxElements/CentralButtons.js';
import { EventEmitter } from 'node:events';

// extends UITab but really a element (with some children)
export default class PlayerBox extends UIElement {
    children = [];

    constructor() {
        super();
        this.progressBar = new ProgressBar();
        this.centralButtons = new CentralButtons();
    }

    init(styles) {
        this.e = blessed.box(styles['player-box']);

        this.progressBar.init(styles);
        this.progressBar.on('needs-rerender', () => this.emit('needs-rerender'));
        
        this.centralButtons.init(styles);
        this.centralButtons.on('needs-rerender', () => this.emit('needs-rerender'));
    }

    appendTo(parent) {
        parent.append(this.e);

        this.progressBar.appendTo(this.e);
        this.centralButtons.appendTo(this.e);
    }

    show() {
        super.show();

        this.progressBar.show();
        this.centralButtons.show();
    }

    update() {
        this.progressBar.update();
        this.centralButtons.update();
    }
}