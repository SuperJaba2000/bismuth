import { readFileSync } from 'fs';
import json5 from 'json5';

export let debug = true;

export function load_config() {
    try {
        const config = json5.parse(readFileSync('./config.json5', 'utf-8'));
        debug = config.debug || false;
    } catch (error) {
        console.error('Failed to read or parse config from json5 file!', error);
    }
}