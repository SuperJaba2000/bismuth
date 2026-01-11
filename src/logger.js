import { log } from 'console';
import fs from 'fs';
import path from 'path';
import winston from 'winston';



// create separate log file for each session
const SEPARATED_SESSION_LOGS = false;
// create separate log file for uncaught exceptions and rejections ('-ER' = Exceptions and Rejections)
const SEPARATED_ERROR_LOGS = false;

// only if not SEPARATED_SESSION_LOGS
const CLEAR_OLD_LOGS = true;


const logs_dir = path.join(process.cwd(), '/bismuth-logs');

// create logs directory if it doesn't exist
if (!fs.existsSync(logs_dir)) {
    fs.mkdirSync(logs_dir);
}

const base_log_file_name = path.join(logs_dir, 'bismuth');

// unique log file name for current session
const session_log_file_name = path.join(logs_dir,`session-${new Date().toISOString().replace(/[:.]/g, "-")}`);

const log_file_name = SEPARATED_SESSION_LOGS ? session_log_file_name : base_log_file_name;

// separate log file for uncaught exceptions and rejections (if SEPARATED_ERROR_LOGS is true)
const ER_log_file_name = log_file_name + '-ER';
const error_log_file_name = SEPARATED_ERROR_LOGS ? ER_log_file_name : base_log_file_name;

// clear old logs
if(!SEPARATED_SESSION_LOGS && CLEAR_OLD_LOGS) {
    if(fs.existsSync(log_file_name + '.log')) {
        fs.unlinkSync(log_file_name + '.log');
    }

    if(fs.existsSync(error_log_file_name + '.log')) {
        fs.unlinkSync(error_log_file_name + '.log');
    }
}


const logger = winston.createLogger({
    level: "info",

    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),

        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
        })
    ),

    transports: [
        //new winston.transports.Console(),
        new winston.transports.File({ filename: log_file_name + '.log' })
    ],

    // automatically handle uncaught exceptions
    exceptionHandlers: [
        new winston.transports.Console(),
        // separate log file for uncaught exceptions and rejections
        new winston.transports.File({ filename: error_log_file_name + '.log' }),
    ],

    // automatically handle rejected promises
    rejectionHandlers: [
        new winston.transports.Console(),
        // separate log file for uncaught exceptions and rejections
        new winston.transports.File({ filename: error_log_file_name + '.log' }),
    ],

    exitOnError: false
});

logger.info('Logger initialized.');

export default logger;