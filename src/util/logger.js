import fs from 'fs';
import path from 'path';
import winston from 'winston';
import { tmpdir } from 'os';

const FORCE_CONSOLE_LOGS = process.env.FORCE_CONSOLE_LOGS === 'true' || false;

const getLogsDir = () => {
    try {
        const homeDir = process.env.HOME || process.env.USERPROFILE || process.cwd();
        
        const possiblePaths = [
            path.join(process.cwd(), 'bismuth-logs'),
            path.join(homeDir, 'bismuth-logs'),
            //path.join(__dirname, 'bismuth-logs')
        ];
        
        for (const logPath of possiblePaths) {
            try {
                if (!fs.existsSync(logPath)) {
                    fs.mkdirSync(logPath, { recursive: true });
                }
                
                const testFile = path.join(logPath, 'test.txt');
                fs.writeFileSync(testFile, 'test');
                fs.unlinkSync(testFile);
                
                console.log(`Логи будут сохранены в: ${logPath}`);
                return logPath;
            } catch (err) {
                continue;
            }
        }
        
        const tempDir = path.join(tmpdir(), 'bismuth-logs');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        console.log(`Logs will be saved to temp dir: ${tempDir}`);
        return tempDir;
        
    } catch (error) {
        console.error('Error getting logs dir: ', error);
        return path.join(tmpdir(), 'bismuth-logs');
    }
};

const logs_dir = getLogsDir();
const base_log_file_name = path.join(logs_dir, 'bismuth');


let logger;

try {
    logger = winston.createLogger({
        level: "info",

        format: winston.format.combine(
            winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            winston.format.printf(({ timestamp, level, message }) => {
                return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
            })
        ),

        transports: FORCE_CONSOLE_LOGS ? [new winston.transports.Console()] : [],

        exceptionHandlers: [
            new winston.transports.Console()
        ],
        rejectionHandlers: [
            new winston.transports.Console()
        ],
        exitOnError: false
    });
    
    // trying to add file transport
    try {
        const fileTransport = new winston.transports.File({ 
            filename: base_log_file_name + '.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        });
        
        logger.add(fileTransport);
        
        // errors and rejections handlers
        logger.exceptions.handle(
            new winston.transports.File({ filename: base_log_file_name + '-exceptions.log' })
        );
        
        logger.rejections.handle(
            new winston.transports.File({ filename: base_log_file_name + '-rejections.log' })
        );
        
    } catch (fileError) {
        logger.warn(`Error adding file transport: ${fileError.message}`);
    }
    
    logger.info('-------------------------------------')
    logger.info('Logger initialized');
    
} catch (error) {
    // Fallback: простой console логгер
    console.error('Error initializing logger: ', error);

    logger = {
        info: (msg) => console.log(`[INFO]: ${msg}`),
        error: (msg) => console.error(`[ERROR]: ${msg}`),
        warn: (msg) => console.warn(`[WARN]: ${msg}`),
        debug: (msg) => console.debug(`[DEBUG]: ${msg}`)
    };

    logger.info('Using fallback logger (console)');
}

export default logger;