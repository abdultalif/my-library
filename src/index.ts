import express, { Application, Response, Request } from 'express';
import { errorMiddleware } from './middleware/error-middleware';
import logger from './utils/logging';
import './utils/connectDB';
import router from './router/index';

const app: Application = express();
const port: Number = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);
app.use(errorMiddleware);

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ sayhello: 'Hello World!' });
});

app.listen(port, () => {
  logger.info(`Backend listening at http://localhost:${port}`);
});
