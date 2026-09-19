import { EventEmitter } from "node:events";
import logger from "../../util/logger.js";

export default class UITab extends EventEmitter {
    name = 'tab';
    active = false;
    children = {};

    get childrenList() {
        return Object.values(this.children);
    }

    setActive(active) {
        this.active = active;

        if(active) {
            logger.debug(`Tab "${this.name}" is active`);
            this.show();
        } else {
            this.hide();
        }
    }

    addChild(name, child) {
        this.children[name] = child;
    }

    appendTo(parent) {
        for (const child of this.childrenList) {
            parent.append(child);
        }
    }

    show() {
        for (const child of this.childrenList) {
            child.show();
        }
    }

    hide() {
        for (const child of this.childrenList) {
            child.hide();
        }
    }

    prerender() {}
}