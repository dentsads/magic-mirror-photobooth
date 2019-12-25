//import winston from 'winston';
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, json } = format;
require('winston-daily-rotate-file');

const level = process.env.LOG_LEVEL || 'debug';

const logger = createLogger({
    level: 'info',
    format: combine(       
        timestamp(),
        json()      
    ),
    exitOnError: false,
    //defaultMeta: { service: 'user-service' },
    transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //
        new transports.File({ filename: 'logs/application.stderr.log', level: 'error' }),
        new transports.File({ filename: 'logs/application.stdout.log' }),
        
        new (transports.DailyRotateFile)({
            level: 'error',
            filename: 'application-%DATE%.stderr.log',
            datePattern: 'YYYY-MM-DD-HH',
            dirname: 'logs',
            zippedArchive: false,
            maxSize: '20m',
            maxFiles: '10'
        }),
        new (transports.DailyRotateFile)({
            level: 'info',
            filename: 'application-%DATE%.stdout.log',
            datePattern: 'YYYY-MM-DD-HH',
            dirname: 'logs',
            zippedArchive: false,
            maxSize: '20m',
            maxFiles: '10'
        })
    ]
});

export { logger }