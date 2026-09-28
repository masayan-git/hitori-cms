import { db } from '../db.ts';

export interface InputPost {
  slug: string;
  title: string;
  body: string;
  published: 0 | 1;
}

export interface Post extends InputPost {
  id: number;
}

export function getAllPosts(): Post[] {
  return db.prepare('SELECT * FROM posts').all() as Post[];
}

export function getPost(id: number): Post | undefined {
  const statement = db.prepare('SELECT * FROM posts WHERE id = ?');
  const row = statement.get(id) as Post | undefined;

  return row;
}

export function deletePost(id: number): boolean {
  const statement = db.prepare('DELETE FROM posts WHERE id = ?');
  const result = statement.run(id);

  return result.changes === 1;
}

export function putPost(id: number, post: InputPost): Post | undefined {
  const put = db.prepare(
    'UPDATE posts SET slug = @slug, title = @title, body = @body, published = @published WHERE id = @id',
  );

  const result = put.run({ ...post, id });

  return result.changes === 1 ? getPost(id) : undefined;
}

export function savePost(post: InputPost): Post | undefined {
  const insert = db.prepare(
    'INSERT INTO posts (slug, title, body, published) VALUES (@slug, @title, @body, @published)',
  );

  const lastInsertRowid = insert.run(post).lastInsertRowid;

  return getPost(Number(lastInsertRowid));
}
