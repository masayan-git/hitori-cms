import Database from 'better-sqlite3';

export const db = new Database('src/data/hitori.db');

console.log('dbを開きました')
