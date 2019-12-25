const { createLogger, format, transports } = require('winston');
const { combine, timestamp, json, splat } = format;
require('winston-daily-rotate-file');

const level = process.env.LOG_LEVEL || 'debug';

const logger = createLogger({
    level: level,
    format: combine(
        splat(),     
        timestamp(),
        json()      
    ),
    exitOnError: false,

    // https://github.com/winstonjs/winston-daily-rotate-file/blob/v4.4.0/README.md
    transports: [
        new (transports.DailyRotateFile)({
            level: 'error',
            filename: 'server-%DATE%.stderr.log',
            datePattern: 'YYYY-MM-DD-HH',
            dirname: 'logs',
            zippedArchive: false,
            maxSize: '20m',
            maxFiles: '10'
        }),
        new (transports.DailyRotateFile)({
            level: level,
            filename: 'server-%DATE%.stdout.log',
            datePattern: 'YYYY-MM-DD-HH',
            dirname: 'logs',
            zippedArchive: false,
            maxSize: '20m',
            maxFiles: '10'
        })
    ]
});

export { logger }