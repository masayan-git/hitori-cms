import type { Request, Response } from 'express';
import {
  deletePost,
  getAllPosts,
  getPost,
  putPost,
  savePost,
} from '../models/post.ts';
import { adjustPost } from '../validators/post.ts';
import { isInvalidId } from '../validators/params.ts';
import { isUniqueConstraintError } from '../db/errors.ts';

export function index(_req: Request, res: Response): void {
  const rows = getAllPosts();
  res.json(rows);
}

export function create(req: Request, res: Response): void {
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
}

export function show(req: Request, res: Response): void {
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
}

export function update(req: Request, res: Response): void {
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
}

export function destroy(req: Request, res: Response): void {
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
}
