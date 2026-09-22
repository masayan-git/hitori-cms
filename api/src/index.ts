import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import { db } from './db.ts';
import Database from 'better-sqlite3';

interface InputPost {
  slug: string;
  title: string;
  body: string;
  published: 0 | 1;
}

interface Post extends InputPost {
  id: number;
}

const app: Express = express();
const port = 3000;

function isInvalidId(id: number): boolean {
  return id <= 0 || !Number.isInteger(id);
}

function isPost(post: unknown): post is InputPost {
  if (typeof post !== 'object' || post === null) return false;

  return (
    'title' in post &&
    typeof post.title === 'string' &&
    'slug' in post &&
    typeof post.slug === 'string' &&
    post.slug !== '' &&
    'body' in post &&
    typeof post.body === 'string' &&
    'published' in post &&
    (post.published === 0 || post.published === 1)
  );
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Database.SqliteError &&
    error.code === 'SQLITE_CONSTRAINT_UNIQUE'
  );
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

function putPost(id: number, post: InputPost): Post | undefined {
  const put = db.prepare(
    'UPDATE posts SET slug = @slug, title = @title, body = @body, published = @published WHERE id = @id',
  );

  const result = put.run({ ...post, id });

  return result.changes === 1 ? getPost(id) : undefined;
}

function savePost(post: InputPost): Post | undefined {
  const insert = db.prepare(
    'INSERT INTO posts (slug, title, body, published) VALUES (@slug, @title, @body, @published)',
  );

  const lastInsertRowid = insert.run(post).lastInsertRowid;

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
  const post: unknown = req.body;

  if (!isPost(post)) {
    res.status(400).json({ message: '記事の形式が正しくありません' });

    return;
  }

  try {
    const savedPost = savePost(post);
    res.status(201).json(savedPost);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      res.status(409).json({ message: 'slugが重複しています' });
    } else {
      throw error;
    }
  }
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

app.put('/posts/:id', (req, res) => {
  const id = Number(req.params.id);
  const post: unknown = req.body;
  if (isInvalidId(id)) {
    res.status(400).json({ message: 'URLの形式が正しくありません' });

    return;
  }

  if (!isPost(post)) {
    res.status(400).json({ message: '記事の形式が正しくありません' });

    return;
  }

  try {
    const row = putPost(id, post);

    if (row === undefined) {
      res.status(404).json({ message: 'ページが存在しません' });

      return;
    }

    res.status(200).json(row);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      res.status(409).json({ message: 'slugが重複しています' });
    } else {
      throw error;
    }
  }
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
