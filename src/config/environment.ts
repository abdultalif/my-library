import 'dotenv/config';

const CONFIG = {
  db: globalThis.process.env.MONGODB,
  jwtSecret: globalThis.process.env.JWT_SECRET,
  jwtExpiresIn: globalThis.process.env.JWT_EXPIRES_IN,
  jwtRefreshSecret: globalThis.process.env.JWT_REFRESH_SECRET,
  jwtRefreshExpiresIn: globalThis.process.env.JWT_REFRESH_EXPIRES_IN,
  mailService: globalThis.process.env.MAIL_SERVICE,
  mailUser: globalThis.process.env.MAIL_USER,
  mailPassword: globalThis.process.env.MAIL_PASSWORD,
  mailFrom: globalThis.process.env.MAIL_FROM,
  rabbitMQUrl: globalThis.process.env.RABBITMQ_URL,
};

export default CONFIG;
