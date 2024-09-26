import mongoose from 'mongoose';
import config from '../config/environment';
import logger from './logging';

mongoose
  .connect(`${config.db}`)
  .then(() => {
    logger.info('MongoDB connected');
  })
  .catch((err) => {
    logger.error('MongoDB connection error');
    logger.error(err);
    globalThis.process.exit(1);
  });
