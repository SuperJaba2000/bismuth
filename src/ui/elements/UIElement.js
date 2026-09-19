import { EventEmitter } from 'node:events';

export default class UIElement extends EventEmitter {
    appendTo(parent) {
        parent.append(this.e);
    }

    show() {
        this.e.show();
    }

    hide() {
        this.e.hide();
    }

    prerender() {}
}