import winston from 'winston';
import 'winston-daily-rotate-file';

const transports: winston.transport[] = [
  new winston.transports.Console({
    level: 'silly',
    handleExceptions: true,
    format: winston.format.combine(winston.format.colorize({ all: true })),
  }),
];

if (!process.env.VERCEL_ENV) {
  const transport = new winston.transports.DailyRotateFile({
    filename: './logs/app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '1m',
    maxFiles: '14d',
    level: 'error',
    handleExceptions: true,
  });

  transports.push(transport);
}

const logger = winston.createLogger({
  level: 'silly',
  format: winston.format.combine(
    winston.format.json({ space: 2 }),
    winston.format.timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }),
    winston.format.label({ label: '[LOGGER]' }),
    winston.format.printf((info) => ` ${info.label} ${info.timestamp} ${info.level.toUpperCase()} : ${info.message}`),
  ),
  transports,
});

export default logger;
