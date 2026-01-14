import logger from "../logger.js";
import { readFile } from "fs/promises";
import { audio_context } from "./audio-system.js";
import { decode } from "./audio-decoder.js";

function log(message, ...args) {
    logger.info(`[AUDIO LOADER] ${message}`, ...args);
}

export async function load_wav(file_path) {
    try {
        const file_buffer = await readFile(file_path);
        audio_buffer = await audio_context.decodeAudioData(file_buffer.buffer);

        return audio_buffer;
    } catch (error) {
        logger.error('Failed to load WAV:', error);
        show_message('Failed to load file!', 1);

        return null;
    }
}

export async function load_with_decode(file_path) {
    try {
        const decoded_audio_buffer = await decode(file_path, {
            freq: 44100,
            channels: 2,
            bit_depth: 16
        });

        audio_buffer = decoded_audio_buffer;

        return audio_buffer;
    } catch (error) {
        logger.error('Failed to decode file: ', error);
        show_message('Failed to decode file!', 1);

        return null;
    }
}