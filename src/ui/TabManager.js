import logger from '../util/logger.js';
import { EventEmitter } from 'node:events';
import WelcomeTab from './tabs/WelcomeTab.js';
import FilesTab from './tabs/FilesTab.js';
import ConfigTab from './tabs/ConfigTab.js';
import TabHeader from './elements/TabHeader.js';

export default class TabManager extends EventEmitter {
    tabs = [];
    // for debug
    activeTab = 1;

    tabHeader;

    constructor() {
        super();
        this.tabs = [
            new WelcomeTab(),
            new FilesTab(),
            new ConfigTab(),
        ];
        
        this.tabHeader = new TabHeader();
    }

    init(styles) {
        this.tabHeader.init(styles);
        this.tabHeader.on('needs-rerender', () => this.emit('needs-rerender'));

        for (const tab of this.tabs) {
            tab.init(styles);
            tab.on('needs-rerender', () => this.emit('needs-rerender'));
            tab.on('message', (text, timeout) => this.emit('message', text, timeout));
            //tab.hide();
        }
    }

    appendTo(parent) {
        for (const tab of this.tabs) {
            tab.appendTo(parent);
            tab.hide();
        }

        // append in the end for be on top
        this.tabHeader.appendTo(parent);
    }

    showActive() {
        for (let i = 0; i < this.tabs.length; i++) {
            const tab = this.tabs[i];
            tab.setActive(i == this.activeTab);
        }

        // TODO rerender only if activeTab was changed
        this.emit('needs-rerender');
    }

    nextTab() {
        this.activeTab += 1;

        if(this.activeTab >= this.tabs.length) {
            this.activeTab = 1;
        }

        const newTab = this.tabs[this.activeTab];

        this.showActive();
        this.tabHeader.changeTab(newTab);
    }

    prerender() {
        for (const tab of this.tabs) {
            tab.prerender();
        }
    }
}