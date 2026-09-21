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

function isInvalidId(id: number): boolean {
  return id <= 0 || !Number.isInteger(id);
}

function getPost(id: number): Post | undefined {
  const statement = db.prepare('SELECT * FROM posts WHERE id = ?');
  const row = statement.get(id) as Post | undefined;

  return row;
}

function deletePost(id: number): boolean {
  const statement = db.prepare('DELETE FROM posts WHERE id = ?');
  const result = statement.run(id);

  return result.changes === 1;
}

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

  return getPost(Number(lastInsertRowid));
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

app.get('/posts/:id', (req, res) => {
  const id = Number(req.params.id);

  if (isInvalidId(id)) {
    res.status(400).json({ message: 'URLの形式が正しくありません' });
    return;
  }

  const row = getPost(id);

  if (row === undefined) {
    res.status(404).json({ message: 'ページが存在しません' });
    return;
  }

  res.json(row);
});

app.delete('/posts/:id', (req, res) => {
  const id = Number(req.params.id);

  if (isInvalidId(id)) {
    res.status(400).json({ message: 'URLの形式が正しくありません' });
    return;
  }

  const isSuccess = deletePost(id);

  if (!isSuccess) {
    res.status(404).json({ message: 'ページが存在しません' });

    return;
  }

  res.status(204).end();
});

app.listen(port, () => {
  console.log(`Express app listening on port ${port}`);
});
