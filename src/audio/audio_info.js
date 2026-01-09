import { parseFile } from 'music-metadata';
import { basename, extname } from 'path';
import logger from '../logger.js';

export async function get_track_info(file_path) {
    const file_ext = extname(file_path);
    const file_name = basename(file_path, file_ext);

    const data = await parseFile(file_path);
    const { common, format } = data;

    return {
        ext: file_ext,
        title: common.title || file_name,
        artist: '- ' + (common.artist || 'Unknown'),
        duration: format.duration || 0
    }
}