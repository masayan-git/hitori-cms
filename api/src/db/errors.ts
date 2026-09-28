import Database from 'better-sqlite3';

export function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Database.SqliteError &&
    error.code === 'SQLITE_CONSTRAINT_UNIQUE'
  );
}
