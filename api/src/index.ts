import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import Database from 'better-sqlite3';
import {
  deletePost,
  getAllPosts,
  getPost,
  putPost,
  savePost,
  type InputPost,
} from './models/posts.ts';

const app: Express = express();
const port = 3000;

function isInvalidId(id: number): boolean {
  return id <= 0 || !Number.isInteger(id);
}

function adjustPost(post: unknown): InputPost | undefined {
  if (typeof post !== 'object' || post === null) return undefined;

  if (
    'title' in post &&
    typeof post.title === 'string' &&
    'slug' in post &&
    typeof post.slug === 'string' &&
    'body' in post &&
    typeof post.body === 'string' &&
    'published' in post &&
    (post.published === 0 || post.published === 1)
  ) {
    const trimmed: InputPost = {
      slug: post.slug.trim(),
      title: post.title.trim(),
      body: post.body,
      published: post.published,
    };

    if (trimmed.title === '' || trimmed.slug === '') return undefined;
    return trimmed;
  } else {
    return undefined;
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Database.SqliteError &&
    error.code === 'SQLITE_CONSTRAINT_UNIQUE'
  );
}

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('こんにちは、世界');
});

app.get('/posts', (_req, res) => {
  const rows = getAllPosts();
  res.json(rows);
});

app.post('/posts', (req, res) => {
  const post = adjustPost(req.body);

  if (post === undefined) {
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
  const post = adjustPost(req.body);
  if (isInvalidId(id)) {
    res.status(400).json({ message: 'URLの形式が正しくありません' });

    return;
  }

  if (post === undefined) {
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
