import amqp, { Channel, ChannelModel } from 'amqplib';
import logger from '../utils/logging';
import CONFIG from '../config/environment';
import { Buffer } from 'buffer';

const EXCHANGE_NAME = 'email_exchange';
const REGISTRATION_QUEUE = 'registration_email_queue';
const FORGOT_PASSWORD_QUEUE = 'forgot_password_email_queue';

const REGISTRATION_ROUTING_KEY = 'email.registration';
const FORGOT_PASSWORD_ROUTING_KEY = 'email.forgot_password';

let channel: Channel | null = null;
let connection: ChannelModel | null = null;

interface EmailMessagePayload {
  name: string;
  email: string;
  token: string;
}

async function connectRabbitMQ(): Promise<Channel> {
  if (channel) {
    return channel;
  }
  if (!CONFIG.rabbitMQUrl) {
    throw new Error('RABBITMQ_URL environment variable is not set');
  }
  try {
    connection = await amqp.connect(CONFIG.rabbitMQUrl);
    logger.info('Successfully connected to RabbitMQ');

    connection.on('error', (err) => {
      logger.error('RabbitMQ connection error:', err.message);
      channel = null;
      connection = null;
    });

    connection.on('close', () => {
      logger.warn('RabbitMQ connection closed. Attempting to reconnect...');
      channel = null;
      connection = null;
    });

    const ch = await connection.createChannel();

    await ch.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
    logger.info(`Exchange "${EXCHANGE_NAME}" asserted.`);

    await ch.assertQueue(REGISTRATION_QUEUE, {
      durable: true,
      arguments: { 'x-queue-type': 'quorum' },
    });
    logger.info(`Queue "${REGISTRATION_QUEUE}" (quorum) asserted.`);

    await ch.assertQueue(FORGOT_PASSWORD_QUEUE, {
      durable: true,
      arguments: { 'x-queue-type': 'quorum' },
    });
    logger.info(`Queue "${FORGOT_PASSWORD_QUEUE}" (quorum) asserted.`);

    await ch.bindQueue(REGISTRATION_QUEUE, EXCHANGE_NAME, REGISTRATION_ROUTING_KEY);
    await ch.bindQueue(FORGOT_PASSWORD_QUEUE, EXCHANGE_NAME, FORGOT_PASSWORD_ROUTING_KEY);

    channel = ch;
    return channel;
  } catch (error) {
    logger.error('Failed to connect to RabbitMQ or setup entities:', error);
    throw error;
  }
}

connectRabbitMQ().catch((err) => {
  logger.error('Initial RabbitMQ setup failed:', err);
});

export const publishEmailTask = async (routingKey: string, payload: EmailMessagePayload): Promise<boolean> => {
  try {
    const currentChannel = await connectRabbitMQ();
    if (!currentChannel) {
      logger.error('RabbitMQ channel not available for publishing.');
      return false;
    }

    const success = currentChannel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
    });

    return success;
  } catch (error) {
    logger.error(`Error publishing message with routing key ${routingKey}:`, error);
    channel = null;
    connection = null;
    return false;
  }
};

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Closing RabbitMQ connection...');
  if (channel) {
    await channel.close();
    logger.info('RabbitMQ channel closed.');
  }
  if (connection) {
    await connection.close();
    logger.info('RabbitMQ connection closed.');
  }
  process.exit(0);
});

export const RabbitMQKeys = {
  REGISTRATION_ROUTING_KEY,
  FORGOT_PASSWORD_ROUTING_KEY,
};
