import Database from 'better-sqlite3';

export const db = new Database('data/hitori.db');

console.log('dbを開きました');

db.exec(`CREATE TABLE IF NOT EXISTS posts(
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  published BOOLEAN NOT NULL CHECK(published == 0 OR published == 1) DEFAULT 0 
)`);
