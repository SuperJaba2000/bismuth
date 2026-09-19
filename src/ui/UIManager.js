import logger from '../util/logger.js';
import blessed from 'reblessed';
import MessageBox from './elements/MessageBox.js';
import PlayerBox from './elements/PlayerBox.js';
import ThemeManager from './ThemeManager.js';
import TabManager from './TabManager.js';

export default class UIManager{
    screen;
    themeManager;
    tabManager;

    root;

    playerBox;
    messageBox;

    currentStyles = {};

    constructor(screen) {
        this.screen = screen;

        this.messageBox = new MessageBox();
        this.playerBox = new PlayerBox();

        this.themeManager = new ThemeManager();
        this.tabManager = new TabManager();
    }

    nextTab() {
        this.tabManager.nextTab();
    }

    init() {
        logger.info('[UI] initializing ui...');

        this.themeManager.load();
        this.currentStyles = this.themeManager.getStyles();

        this.messageBox.init(this.currentStyles);
        this.messageBox.on('needs-rerender', () => this.render());

        this.playerBox.init(this.currentStyles);
        this.playerBox.on('needs-rerender', () => this.render());

        this.tabManager.init(this.currentStyles);
        this.tabManager.on('needs-rerender', () => this.render());
        this.tabManager.on('message', (text, timeout) => this.messageBox.display(text, timeout));

        logger.info('[UI] ui initialized');
    }

    appendToScreen() {
        this.playerBox.appendTo(this.screen);
        this.messageBox.appendTo(this.screen);
        this.tabManager.appendTo(this.screen);

        this.tabManager.showActive();
        this.playerBox.update();
    }

    render() {
        logger.debug('[UI] render')

        this.tabManager.prerender();
        this.playerBox.prerender();

        this.screen.render();
    }
}