import fs from 'fs';
import path from 'path';
import winston from 'winston';

// create separate log file for each session
const separated_logs = false;


const logs_dir = path.join(process.cwd(), '/logs');

// create logs directory if it doesn't exist
if (!fs.existsSync(logs_dir)) {
    fs.mkdirSync(logs_dir);
}

// unique log file name for current session
const session_log_file_name = separated_logs ? path.join(
    logs_dir,
    `session-${new Date().toISOString().replace(/[:.]/g, "-")}`
) : path.join(logs_dir, 'onelog');


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
        new winston.transports.File({ filename: session_log_file_name + '.log' })
    ],

    // automatically handle uncaught exceptions
    exceptionHandlers: [
        new winston.transports.Console(),
        // separate log file for uncaught exceptions and rejections
        new winston.transports.File({ filename: session_log_file_name + '-ER.log' }),
    ],

    // automatically handle rejected promises
    rejectionHandlers: [
        new winston.transports.Console(),
        // separate log file for uncaught exceptions and rejections
        new winston.transports.File({ filename: session_log_file_name + '-ER.log' }),
    ],

    exitOnError: false
});

export default logger;