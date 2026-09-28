import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import { create, destroy, index, show, update } from './controllers/posts.ts';

const app: Express = express();
const port = 3000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('こんにちは、世界');
});

app.get('/posts', index);
app.get('/posts/:id', show);
app.post('/posts', create);
app.put('/posts/:id', update);
app.delete('/posts/:id', destroy);

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  if (
    error instanceof Error &&
    'type' in error &&
    error.type === 'entity.parse.failed'
  ) {
    res.status(400).json({ message: 'JSONの形式が正しくありません' });

    return;
  }
  res.status(500).json({ message: '予期せぬエラーです' });
});

app.listen(port, () => {
  console.log(`Express app listening on port ${port}`);
});
