import blessed from 'reblessed';
import { readdirSync } from 'fs';
import { join } from 'path';
import logger from '../logger.js';


export let tab_files_separator, tab_files_filemanager;

function get_directory_content(dir_path) {
    try {
        const files = readdirSync(dir_path, { withFileTypes: true });

        return files.map(file => {
            return {
                name: file.name,
                type: file.isDirectory() ? 'dir' : 'file',
                path: join(dir_path, file.name)
            }
        });
    }catch(err) {
        logger.error('Failed to read directory content!', err);
    }
}


export function init_tab_files(screen, ui_options) {
    tab_files_separator = blessed.line(ui_options['tab_files_separator']);

    screen.append(tab_files_separator);

    tab_files_filemanager = blessed.filemanager({
        ...ui_options['tab_files_filemanager'],
    });

    tab_files_filemanager.cwd = process.cwd();

    tab_files_filemanager.on('select', function(file) {
        logger.info('File selected: ', file);
    });

    tab_files_filemanager.refresh(process.cwd(), () => {
        tab_files_filemanager.focus();
    });

    screen.append(tab_files_filemanager);
}

export function hide_tab_files() {
    tab_files_separator.hide();
    tab_files_filemanager.hide();
}

export function show_tab_files() {
    tab_files_separator.show();
    tab_files_filemanager.show();
}