import json5 from 'json5';
import YAML from 'yaml';
import { join, extname, basename } from 'path';
import { readdirSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import logger from '../util/logger.js';

// TODO move to config
const THEME_DIR = './themes';

export default class ThemeManager {
    themes = {};
    currentTheme = 'old';

    load() {
        if (!existsSync(THEME_DIR)) {
            logger.info('The catalog with themes was not found!');
            return;
        }

        const dirContent = readdirSync(THEME_DIR, { withFileTypes: true });
        const themePaths = dirContent.filter(entry => entry.isDirectory()).map(entry => entry.name);

        for(const themePath of themePaths) {
            this.loadTheme(join(THEME_DIR, themePath));
        }
    }

    loadTheme(themePath) {
        let theme = {};
        let themeName = 'unnamed-theme';

        const files = readdirSync(themePath, { recursive: true });
        const configFiles = files.filter(file => file.endsWith('.yaml') || file.endsWith('.yml') || file.endsWith('.json5'))
            .map(file => join(themePath, file));

        for(const filePath of configFiles) {
            try {
                const fileContent = readFileSync(filePath, 'utf8');
                const fileExtension = extname(filePath);

                let data = {};

                if(['.yaml', '.yml'].includes(fileExtension)){
                    data = YAML.parse(fileContent);
                } else {
                    data = json5.parse(fileContent);
                }

                if(basename(filePath, fileExtension) == 'theme') {
                    themeName = data.theme.name || 'unnamed-theme';

                    // themeName = data.name;
                }

                theme = {
                    ...theme,
                    ...data
                };
            } catch (error) {
                logger.error(`Failed to process style file at ${filePath}:`);
                logger.error(error.message);
            }
        }

        this.themes[themeName] = theme;

        logger.info(`Theme "${themeName}" succesfully loaded.`);
    }

    getStyles() {
        return this.themes[this.currentTheme];
    }
}