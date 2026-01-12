export const colors = {
    reset: '\x1b[0m',

    fg_white : '\x1b[37m',
    fg_black : '\x1b[30m',
    fg_blue : '\x1b[34m',
    fg_green : '\x1b[32m',
    fg_red : '\x1b[31m',
    fg_yellow : '\x1b[33m',

    bg_white : '\x1b[47m',
    bg_black : '\x1b[40m',
    bg_blue : '\x1b[44m',
    bg_green : '\x1b[42m',
    bg_red : '\x1b[41m',
    bg_yellow : '\x1b[43m'
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function get_screen_size() {
    return {
        width: process.stdout.columns,
        height: process.stdout.rows
    };
}