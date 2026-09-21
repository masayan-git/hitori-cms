import express, { type Express } from 'express';
import { db } from './db.ts';

interface Post {
  id: number;
  slug: string;
  title: string;
  body: string;
  published: 0 | 1;
}

const app: Express = express();
const port = 3000;

function savePost(reqInput: {
  slug: string;
  title: string;
  body: string;
  published?: 0 | 1;
}): Post | undefined {
  const insert = db.prepare(
    'INSERT INTO posts (slug, title, body, published) VALUES (@slug, @title, @body, @published)',
  );

  const lastInsertRowid = insert.run({
    ...reqInput,
    published: reqInput.published ?? 0,
  }).lastInsertRowid;

  const statement = db.prepare('SELECT * FROM posts WHERE id = ?');
  const row = statement.get(lastInsertRowid) as Post | undefined;

  return row;
}

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('こんにちは、世界');
});

app.get('/posts', (_req, res) => {
  const rows = db.prepare('SELECT * FROM posts').all() as Post[];
  res.json(rows);
});

app.post('/posts', (req, res) => {
  res.status(201).json(savePost(req.body));
});

app.listen(port, () => {
  console.log(`Express app listening on port ${port}`);
});
