import logger from "../util/logger.js";
import { readFile } from "fs/promises";
import { audioContext } from "./audio-system.js";
import { decode } from "./decoder.js";


export async function loadWav(path) {
    try {
        const fileBuffer = await readFile(path);
        const audioBuffer = await audioContext.decodeAudioData(fileBuffer.buffer);

        return audioBuffer;
    } catch (error) {
        logger.error('Failed to load WAV:', error);
    }
}

export async function loadAndDecode(path) {
    try {
        const audioBuffer = await decode(path, {
            freq: 44100,
            channels: 2,
            bit_depth: 16
        });

        return audioBuffer;
    } catch (error) {
        logger.error('Failed to decode file: ', error);
    }
}