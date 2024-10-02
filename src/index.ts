import logger from './utils/logging';
import './utils/connectDB';
import createServer from './utils/server';

const app = createServer();
const port: Number = 9000;

app.listen(port, () => {
  logger.info(`Backend listening at http://localhost:${port}`);
});
