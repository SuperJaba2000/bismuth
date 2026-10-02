import { EventEmitter } from "node:events";
import blessed from "reblessed";
import logger from "../util/logger.js";
import ConfigManager from "./ConfigManager.js";
import ApplicationState from "./ApplicationState.js";
import UIManager from "../ui/UIManager.js";
import AudioSystem from "../audio/AudioSystem.js";
import { initKeybindings } from "../util/keybindings.js";

export default class Application extends EventEmitter {
    config = new ConfigManager();
    state = new ApplicationState();
    as = new AudioSystem();
    ui = new UIManager();

    screen;
    
    constructor() {
        super();
        this.screen = blessed.screen({
            smartCSR: true,
            terminal: 'xterm-256color',
            fullUnicode: false
        });

        this.screen.key(['C-c'], () => process.exit(0));
    }

    init() {
        logger.info('started Application.init()');

        this.config.readConfig();
        this.state.init();
        this.ui.init();
        this.ui.appendToScreen();

        initKeybindings();

        logger.info('Application.init() finished');
    }

    fire(eventName, ...args) {
        this.emit(eventName, ...args);
    }
}