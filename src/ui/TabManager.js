import { EventEmitter } from 'node:events';
import logger from '../util/logger.js';
import { state } from '../app.js';
import WelcomeTab from './tabs/WelcomeTab.js';
import FilesTab from './tabs/FilesTab.js';
import ConfigTab from './tabs/ConfigTab.js';
import TabHeader from './elements/TabHeader.js';

export default class TabManager extends EventEmitter {
    tabs = [];

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

    get activeTabIndex() {
        for(let i = 0; i < this.tabs.length; i++) {
            if(this.tabs[i].name == state.get("active-tab"))
                return i;
        }
    }

    get activeTab() {
        return this.tabs[this.activeTabIndex];
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

    nextTab() {
        let newTabIndex = (this.activeTabIndex + 1) % this.tabs.length;

        if(newTabIndex == 0){
            newTabIndex = 1;
        }

        const newTab = this.tabs[newTabIndex];

        state.set("active-tab", newTab.name);

        this.tabHeader.changeTab(newTab);
    }

    update() {
        this.activeTab.show();
    }

    prerender() {
        for (const tab of this.tabs) {
            tab.prerender();
        }
    }
}