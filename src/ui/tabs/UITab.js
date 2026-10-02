import { EventEmitter } from "node:events";
import logger from "../../util/logger.js";
import { state } from '../../app.js';

export default class UITab extends EventEmitter {
    name = 'tab';
    children = {};

    get childrenList() {
        return Object.values(this.children);
    }

    get isActive() {
        return state.get("active-tab") == this.name;
    }

    init() {
        state.on("change:active-tab", () => {
            if(this.isActive) {
                logger.debug(`Active tab changed to "${this.name}"`);
                this.show();
            } else {
                this.hide();
            }
        })
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