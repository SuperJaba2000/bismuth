import { join } from 'path';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import pathToFfmpeg from 'ffmpeg-static';
import logger from '../util/logger.js';

let ffmpegPath = pathToFfmpeg;

logger.info(`ffmpeg path (default): ${ffmpegPath}`);

// if app is packed with pkg, copy ffmpeg to temp dir
if (process.pkg) {
    logger.info(`app running in snapshot, copying ffmpeg to temp dir`);

    const tempDir = join(tmpdir(), 'bismuth');
    const targetPath = join(tempDir, 'ffmpeg' + (process.platform === 'win32' ? '.exe' : ''));

    logger.info(`target path: ${targetPath}`);

    if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

    if (!existsSync(targetPath)) {
        copyFileSync(ffmpegPath, targetPath);
    }

    if (process.platform !== 'win32') {
        import('fs').then(fs => fs.chmodSync(targetPath, 0o755));
    }

    ffmpegPath = targetPath;

    logger.info(`ffmpeg copied, path (temp): ${ffmpegPath}`);
}

export default ffmpegPath;