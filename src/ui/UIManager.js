import logger from '../util/logger.js';
import blessed from 'reblessed';
import json5 from 'json5';
import { readFileSync } from 'node:fs';
import WelcomeTab from './tabs/WelcomeTab.js';
import FilesTab from './tabs/FilesTab.js';
import ConfigTab from './tabs/ConfigTab.js';
import TabHeader from './TabHeader.js';

export default class UIManager{
    screen;
    stylesPath = './styles';

    styles = {};
    tabs = [];
    activeTab = 0;

    // global elements
    tabHeader;
    playerBox;
    messageBox;

    constructor(screen) {
        this.screen = screen;
        this.tabs = [
            new WelcomeTab(),
            new FilesTab(),
            // new YandexTab(),
            new ConfigTab(),
        ];

        this.tabHeader = new TabHeader();
    }

    loadStyleModule(moduleName) {
        try {
            const file = readFileSync(`${this.stylesPath}/${moduleName}.json5`, 'utf-8');
            const data = json5.parse(file);
            return data;
        }catch(error) {
            logger.error(`[UI] Failed to read or parse styles from json5 file ${moduleName}`, error);
            return {};
        }
    }

    loadStyles() {
        logger.info('[UI] loading styles...');

        const self = this;

        try {
            this.styles = {
                ...this.loadStyleModule('global'),
                //...this.loadStyleModule('player-box'),
                ...this.loadStyleModule('tab-header'),
                ...self.loadStyleModule('tab-welcome'),
                ...this.loadStyleModule('tab-files'),
            };
        } catch (err) {
            logger.error('[UI] Failed to read or parse styles from json5 files!', err);
            // let user see error message for 3 seconds and then exit
            setTimeout(() => process.exit(1), 3000);
        }
    }

    showMessage(text, timeout) {
        this.messageBox.display(text, timeout);
        this.render();
        return this.messageBox;
    }

    init() {
        const self = this;

        logger.info('[UI] initializing ui...');
        this.loadStyles();
        logger.info('[UI] styles successfully loaded');

        for(const tab of this.tabs) {
            tab.init(this.styles);
            tab.append(this.screen);
            tab.hide(); 

            tab.on('needs-rerender', () => {
                self.render();
            });

            tab.on('message', (text, timeout) => {
                self.showMessage(text, timeout);
            });
        }

        this.tabHeader.init(this.styles);
        this.tabHeader.append(this.screen);
        this.tabHeader.on('needs-rerender', () => {
            self.render();
        });

        // initialize playerBox

        this.messageBox = blessed.message(this.styles['message-box']);
        this.messageBox.hide();
        this.screen.append(this.messageBox);

        this.showActive();

        // logger.info('[UI] ui initialized');

        // this.render();
        // logger.info('[UI] screen rendered');

        // tab_header.setContent('Welcome to Bismuth!');
        // show_tab_header();
    }

    showActive() {
        for(let i = 0; i < this.tabs.length; i++) {
            const tab = this.tabs[i];
            if(i == this.activeTab) {
                tab.show();
                tab.active = true;
            } else {
                tab.hide();
                tab.active = false;
            }
        }

        this.render();
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

    render() {
        for(const tab of this.tabs) {
            tab.prerender();
        }

        //this.playerBox.prerender();

        this.screen.render();
    }
}