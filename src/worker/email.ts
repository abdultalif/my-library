import amqp from 'amqplib';
import logger from '../utils/logging';
import { sendMail, sendMailForgotPassword } from '../utils/send-mail';
import CONFIG from '../config/environment';

const EXCHANGE_NAME = 'email_exchange';
const REGISTRATION_QUEUE = 'registration_email_queue';
const FORGOT_PASSWORD_QUEUE = 'forgot_password_email_queue';
const REGISTRATION_ROUTING_KEY = 'email.registration';
const FORGOT_PASSWORD_ROUTING_KEY = 'email.forgot_password';

interface EmailMessagePayload {
  name: string;
  email: string;
  token: string;
}

export default async function startWorker() {
  try {
    const connection = await amqp.connect(CONFIG.rabbitMQUrl as string);
    const channel = await connection.createChannel();
    logger.info('Email worker connected to RabbitMQ');

    await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
    await channel.assertQueue(REGISTRATION_QUEUE, {
      durable: true,
      arguments: { 'x-queue-type': 'quorum' },
    });
    await channel.assertQueue(FORGOT_PASSWORD_QUEUE, {
      durable: true,
      arguments: { 'x-queue-type': 'quorum' },
    });
    await channel.bindQueue(REGISTRATION_QUEUE, EXCHANGE_NAME, REGISTRATION_ROUTING_KEY);
    await channel.bindQueue(FORGOT_PASSWORD_QUEUE, EXCHANGE_NAME, FORGOT_PASSWORD_ROUTING_KEY);

    channel.prefetch(1);

    logger.info(' [*] Waiting for email messages. To exit press CTRL+C');

    channel.consume(REGISTRATION_QUEUE, async (msg) => {
      if (msg !== null) {
        try {
          const content = msg.content.toString();
          logger.info(`[Registration Worker] Received: ${content}`);
          const payload: EmailMessagePayload = JSON.parse(content);

          await sendMail(payload.name, payload.email, payload.token);
          logger.info(`[Registration Worker] Email sent to ${payload.email}`);
          channel.ack(msg);
        } catch (e) {
          logger.error('[Registration Worker] Error processing message or sending email:', e);
          channel.nack(msg, false, true);
        }
      }
    });

    channel.consume(FORGOT_PASSWORD_QUEUE, async (msg) => {
      if (msg !== null) {
        try {
          const content = msg.content.toString();
          logger.info(`[Forgot Password Worker] Received: ${content}`);
          const payload: EmailMessagePayload = JSON.parse(content);

          await sendMailForgotPassword(payload.name, payload.email, payload.token);
          logger.info(`[Forgot Password Worker] Forgot password email sent to ${payload.email}`);
          channel.ack(msg);
        } catch (e) {
          logger.error('[Forgot Password Worker] Error processing message or sending email:', e);
          channel.nack(msg, false, true);
        }
      }
    });
  } catch (error) {
    logger.error('Email worker failed to connect or start:', error);
    process.exit(1);
  }
}
