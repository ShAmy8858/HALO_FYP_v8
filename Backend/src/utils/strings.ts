export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function splitFullName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const firstName = parts.shift() || "Hospital";
  const lastName = parts.join(" ") || "Manager";
  return { firstName, lastName };
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
