/** Applies one keypad press to the digit string being typed. */
export function applyKey(current: string, key: string): string {
  if (key === "⌫") return current.slice(0, -1);
  if (key === "000") return current === "" || current === "0" ? current : current + "000";
  if (current === "0") return key;
  return current.length < 9 ? current + key : current;
}
