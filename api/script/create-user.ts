import { createInterface } from 'node:readline/promises';
import { hashPassword } from '../src/utils/password.ts';
import { db } from '../src/db/connection.ts';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function askUsername(): Promise<string> {
  while (true) {
    const username = (await rl.question('ユーザー名: ')).trim();

    if (username === '') {
      console.log('一文字以上入力してください');
      continue;
    }

    const row = db
      .prepare('SELECT id FROM users WHERE username = ?')
      .get(username);

    if (row !== undefined) {
      console.log('このユーザーネームはすでに使われています。');
      continue;
    }

    return username;
  }
}

async function askPassword(): Promise<string> {
  while (true) {
    const password = await rl.question('パスワード: ');

    if (password.length < 8) {
      console.log('8文字以上で入力してください');
      continue;
    }

    return password;
  }
}

const username = await askUsername();
const password = await askPassword();

rl.close();

const password_hash = await hashPassword(password);

const insert = db.prepare(
  'INSERT INTO users (username, password_hash) VALUES (@username, @password_hash)',
);

const result = insert.run({ username, password_hash });

console.log(`ようこそ、id: ${result.lastInsertRowid}, ${username}さん`);
