import { EventEmitter } from "node:events";

export default class UITab extends EventEmitter{
    name = 'tab';
    active = false;
    elements = {};

    get elementsList() {
        return Object.values(this.elements);
    }

    append(screen) {
        for(const e of this.elementsList) {
            screen.append(e);
        }
    }

    show() {
        for(const e of this.elementsList) {
            e.show();
        }
    }

    hide() {
        for(const e of this.elementsList) {
            e.hide();
        }
    }

    prerender() {}
}