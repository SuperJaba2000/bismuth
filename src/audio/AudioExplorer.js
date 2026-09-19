import logger from '../util/logger.js';
import ffmpeg from 'fluent-ffmpeg';

// audio info & metadata explorer
export default class AudioExplorer {
    ffprobePath = null;

    async init() {
        this.ffprobePath = await this.getFfprobePath();

        ffmpeg.setFfprobePath(this.ffprobePath);

        logger.info(`AudioExplorer initialized. FFprobe path: ${this.ffprobePath}`);
    }

    async getFfprobePath() {
        try {
            return await this.findSystemFfprobePath();
        } catch {
            try {
                return await this.getBundledFfprobePath();
            } catch {
                throw new Error('Failed to find the system-installed embedded ffprobe binary file!');
            }
        }
    }

    async getBundledFfprobePath() {
        const { path } = await import('ffprobe-static');

        if (!path) {
            throw new Error('Bundled ffprobe not found. Pleasy install ffprobe-static.');
        }

        const tmpDir = join(tmpdir(), 'bismuth');
        const targetPath = join(tmpDir, 'ffprobe' + (process.platform === 'win32' ? '.exe' : ''));

        if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

        if (!existsSync(targetPath)) {
            copyFileSync(path, targetPath);
            logger.info(`Bundled ffprobe copied to temp dir: ${targetPath}`);
        }

        if (process.platform !== 'win32') {
            chmodSync(targetPath, 0o755);
        }

        logger.info(`Using bundled ffprobe: ${targetPath}`);

        return targetPath;
    }

    async findSystemFfprobePath() {
        const finderCMD = process.platform === 'win32'
            ? 'where'
            : 'which';

        try {
            const { stdout } = await execFileAsync(finderCMD, ['ffprobe']);
            const ffmpegPath = stdout.trim().split(/\r?\n/)[0];

            if (!ffmpegPath) {
                throw new Error('FFprobe path is empty');
            }

            return ffmpegPath;
        } catch {
            throw new Error('System FFprobe not found. Install FFprobe and add it to PATH.');
        }
    }

    async getInfo(path) {
        if (!this.ffprobePath) {
            throw new Error('AudioExplorer is not initialized!');
        }

        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(path, (err, metadata) => {
                if (err) throw err;

                // console.log('Формат:', metadata.format.format_name);
                // console.log('Длительность (сек):', metadata.format.duration);
                // console.log('Теги (метаданные):', metadata.format.tags); // Артист, Альбом и т.д.

                // const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
                // if (audioStream) {
                //     console.log('Кодек:', audioStream.codec_name);
                //     console.log('Каналы:', audioStream.channels); // 2 для стерео
                //     console.log('Частота (Гц):', audioStream.sample_rate); // например, 44100
                // }
            });
        });
    }
}