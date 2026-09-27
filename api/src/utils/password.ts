import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(crypto.scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');

  const key = await scryptAsync(password, salt, 64);
  if (!(key instanceof Buffer)) {
    throw new Error('Buffer ではありません');
  }

  return `${salt}:${key.toString('hex')}`;
}
