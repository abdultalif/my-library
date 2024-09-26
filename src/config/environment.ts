import 'dotenv/config';

const CONFIG = {
  db: globalThis.process.env.MONGODB,
};

export default CONFIG;
