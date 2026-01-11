import { basename, extname } from 'path';
import logger from '../logger.js';

// TODO : move to config
const USE_METADATA_MODULE = true;

let music_metadata = null;

export async function get_track_info(file_path) {
    const file_ext = extname(file_path);
    const file_name = basename(file_path, file_ext);

    let metadata = {common: {}, format: {}};

    if(USE_METADATA_MODULE) {
        try{
            if(!music_metadata) {
                music_metadata = await import('music-metadata');
            }

            metadata = await music_metadata.parseFile(file_path);
        }catch(err) {
            logger.error('Failed to get track info using music-metadata! ', err);
        }
    }

    return {
        ext: file_ext,
        title: metadata?.common?.title || file_name,
        artist: '- ' + (metadata?.common?.artist || 'Unknown'),
        duration: metadata?.format?.duration || 3599 // -> 59:59
    }
}