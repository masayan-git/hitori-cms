export function isInvalidId(id: number): boolean {
  return id <= 0 || !Number.isInteger(id);
}
