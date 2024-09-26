import express, { Application, Response, Request } from 'express';

const app: Application = express();
const port: Number = 3000;

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ sayhello: 'Hello World!' });
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
