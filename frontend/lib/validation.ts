export function sanitizeText(value: string, maxLength = 1000) {
  return value
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function isValidGroupName(value: string) {
  const name = sanitizeText(value, 60);
  return name.length >= 2 && name.length <= 60;
}

