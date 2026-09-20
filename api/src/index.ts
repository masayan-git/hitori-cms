import express, { type Express } from 'express';
import { db } from './db.ts';
interface Post {
  id: number;
  title: string;
  body: string;
}

const app: Express = express();
const port = 3000;
const postsContents: Post[] = [];
let postId = 0;

function savePost(reqInput: { title: string; body: string }): Post {
  postId = postId + 1;
  const post: Post = {
    id: postId,
    title: reqInput.title,
    body: reqInput.body,
  };

  postsContents.push(post);

  return post;
}

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('こんにちは、世界');
});

app.get('/posts', (_req, res) => {
  res.json(postsContents);
});

app.post('/posts', (req, res) => {
  res.status(201).json(savePost(req.body));
});

app.listen(port, () => {
  console.log(`Express app listening on port ${port}`);
});
