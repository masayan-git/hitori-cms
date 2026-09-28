import type { InputPost } from '../models/post.ts';

export function adjustPost(post: unknown): InputPost | undefined {
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
