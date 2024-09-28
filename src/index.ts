import express, { Application, Response, Request } from 'express';
import { errorMiddleware } from './middleware/error-middleware';
import logger from './utils/logging';
import './utils/connectDB';
import router from './router/index';
import swaggerUi from 'swagger-ui-express';
import * as swaggerDocument from '../docs/swagger.json';

export const app: Application = express();
const port: Number = 9000;

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.urlencoded({ extended: true }));
app.use(router);
app.use(errorMiddleware);

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ sayhello: 'Hello World!' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    logger.info(`Backend listening at http://localhost:${port}`);
  });
}
