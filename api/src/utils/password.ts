import crypto from 'node:crypto';
import { promisify } from 'node:util';

const KEYLEN = 64;

const scryptAsync = promisify(crypto.scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');

  const key = await scryptAsync(password, salt, KEYLEN);
  if (!(key instanceof Buffer)) {
    throw new Error('Buffer ではありません');
  }

  return `${salt}:${key.toString('hex')}`;
}

export async function verifyPassword(
  inputPassword: string,
  password_hash: string,
): Promise<boolean> {
  const [salt, storedHashHex] = password_hash.split(':');

  const inputHash = await scryptAsync(inputPassword, salt, KEYLEN);
  if (!(inputHash instanceof Buffer)) {
    throw new Error('Buffer ではありません。');
  }

  const storedHash = Buffer.from(storedHashHex, 'hex');

  return crypto.timingSafeEqual(inputHash, storedHash);
}
