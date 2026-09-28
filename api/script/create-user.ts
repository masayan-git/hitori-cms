import { createInterface } from 'node:readline/promises';
import { hashPassword } from '../src/utils/password.ts';
import { db } from '../src/db.ts';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const username = await rl.question('ユーザー名: ');
const password = await rl.question('パスワード: ');

rl.close();

const key = await hashPassword(password);

const insert = db.prepare(
  'INSERT INTO users (username, password_hash) VALUES (@username, @key)',
);

const result = insert.run({ username, key });
