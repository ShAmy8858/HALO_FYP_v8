import path from "path";

/** Canonical types accepted for hospital verification documents (merged with DB settings). */
export const DEFAULT_ALLOWED_DOCUMENT_MIMES: readonly string[] = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const EXTENSION_TO_CANONICAL: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".jpe": "image/jpeg",
  ".webp": "image/webp",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const MIME_TO_CANONICAL: Record<string, string> = {
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
};

const GENERIC_BINARY = new Set(["", "application/octet-stream", "binary/octet-stream"]);

function inferMimeFromFilename(originalName: string): string | null {
  const ext = path.extname(originalName).toLowerCase();
  return EXTENSION_TO_CANONICAL[ext] ?? null;
}

/**
 * Normalize multer's mimetype for validation + DB (`image/jpg` → `image/jpeg`, infer from extension when MIME is missing/generic).
 */
export function resolveDocumentMimeType(multerMime: string, originalName: string): string {
  const raw = (multerMime || "").trim().toLowerCase();
  if (MIME_TO_CANONICAL[raw]) {
    return MIME_TO_CANONICAL[raw];
  }
  if (GENERIC_BINARY.has(raw) || raw === "application/x-download") {
    const inferred = inferMimeFromFilename(originalName);
    return inferred ?? (raw || "application/octet-stream");
  }
  return raw;
}

/** Union of defaults and platform settings so older DB rows still gain new types. */
export function getEffectiveAllowedDocumentMimes(settingsList: string[] | null | undefined): string[] {
  const fromDb = settingsList?.filter(Boolean) ?? [];
  return [...new Set([...DEFAULT_ALLOWED_DOCUMENT_MIMES, ...fromDb])];
}
