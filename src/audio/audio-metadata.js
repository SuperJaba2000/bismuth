import logger from '../logger.js';
import { basename, extname } from 'path';

let music_metadata = null;

export async function get_track_metadata(file_path) {
    const file_ext = extname(file_path);
    const file_name = basename(file_path, file_ext);

    let metadata = { common: {}, format: {} };

    try {
        if (!music_metadata) {
            music_metadata = await import('music-metadata');
        }

        metadata = await music_metadata.parseFile(file_path);
    } catch (err) {
        logger.error('Failed to get track info using music-metadata! ', err);
    }

    const track_metadata = {
        ext: file_ext,
        title: metadata?.common?.title || file_name,
        artist: metadata?.common?.artist || 'Unknown',
        duration: metadata?.format?.duration || null
    };

    return track_metadata;
}