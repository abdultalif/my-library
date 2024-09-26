import express, { Application, Response, Request } from 'express';
// import { errorMiddleware } from './middleware/error-middleware';
// import logger from './middleware/logging-middleware';

const app: Application = express();
const port: Number = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(errorMiddleware);

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ sayhello: 'Hello World!' });
});

app.listen(port, () => {
  // logger.info(`Backend listening at http://localhost:${port}`);
  console.log(`Backend listening at http://localhost:${port}`);
});
