/** Asserts Dexie auto-increment add() returned an id. */
export function requireId(
  id: number | undefined,
  label = "record",
): number {
  if (id === undefined) {
    throw new Error(`Failed to create ${label}`);
  }
  return id;
}
