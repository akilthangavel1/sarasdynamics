import path from "path";

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

export const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc"];

/**
 * Checks magic byte signatures for PDF, DOC, and DOCX.
 */
export function validateFileMagicBytes(buffer: Buffer): { valid: boolean; detectedType?: string } {
  if (!buffer || buffer.length < 4) {
    return { valid: false };
  }

  // PDF signature: %PDF- (hex: 25 50 44 46 2d)
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return { valid: true, detectedType: "application/pdf" };
  }

  // DOCX / ZIP signature: PK\x03\x04 (hex: 50 4b 03 04)
  if (
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04
  ) {
    return {
      valid: true,
      detectedType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
  }

  // Legacy DOC (CFB / OLE) signature: D0 CF 11 E0 A1 B1 1A E1
  if (
    buffer.length >= 8 &&
    buffer[0] === 0xd0 &&
    buffer[1] === 0xcf &&
    buffer[2] === 0x11 &&
    buffer[3] === 0xe0 &&
    buffer[4] === 0xa1 &&
    buffer[5] === 0xb1 &&
    buffer[6] === 0x1a &&
    buffer[7] === 0xe1
  ) {
    return { valid: true, detectedType: "application/msword" };
  }

  return { valid: false };
}

/**
 * Sanitize filename to prevent path traversal, command injection, and illegal characters.
 */
export function sanitizeFilename(originalName: string): string {
  if (!originalName || typeof originalName !== "string") {
    return "resume.pdf";
  }

  // Strip directory paths and null bytes
  const baseName = path.basename(originalName).replace(/\0/g, "");

  // Normalize Unicode and replace path traversal / dangerous characters
  const sanitized = baseName
    .replace(/\.\.+/g, ".") // prevent .. traversal
    .replace(/[^\w\.\-\_]/g, "_") // only alphanumeric, dot, hyphen, underscore
    .replace(/^[\.\-\_]+/, "") // no leading dot/dash
    .trim();

  if (!sanitized || sanitized === ".") {
    return `resume_${Date.now()}.pdf`;
  }

  return sanitized.slice(0, 100);
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedFilename?: string;
  detectedMimeType?: string;
}

export function validateResumeFile(
  file: Express.Multer.File | undefined,
  maxSizeMb: number = 5
): FileValidationResult {
  if (!file) {
    return { valid: false, error: "Resume file is required" };
  }

  if (!file.buffer || file.buffer.length === 0) {
    return { valid: false, error: "Resume file is empty" };
  }

  const maxSizeBytes = maxSizeMb * 1024 * 1024;
  if (file.buffer.length > maxSizeBytes) {
    return {
      valid: false,
      error: `Resume file size exceeds maximum limit of ${maxSizeMb}MB (received ${(file.buffer.length / (1024 * 1024)).toFixed(2)}MB)`,
    };
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file extension (${ext || "none"}). Only PDF, DOCX, and DOC files are accepted`,
    };
  }

  // Check declared MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Invalid MIME type (${file.mimetype}). Only PDF and Word documents are accepted`,
    };
  }

  // Safe signature check on magic bytes
  const magic = validateFileMagicBytes(file.buffer);
  if (!magic.valid) {
    return {
      valid: false,
      error: "File content does not match a valid PDF or Word document signature",
    };
  }

  const sanitizedFilename = sanitizeFilename(file.originalname);

  return {
    valid: true,
    sanitizedFilename,
    detectedMimeType: magic.detectedType || file.mimetype,
  };
}

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

/**
 * Checks magic byte signatures for JPEG, PNG, and WebP.
 */
export function validateImageMagicBytes(buffer: Buffer): { valid: boolean; detectedType?: string } {
  if (!buffer || buffer.length < 12) {
    return { valid: false };
  }

  // JPEG signature: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedType: "image/jpeg" };
  }

  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, detectedType: "image/png" };
  }

  // WebP signature: RIFF....WEBP (52 49 46 46 .... 57 45 42 50)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { valid: true, detectedType: "image/webp" };
  }

  return { valid: false };
}

export function validateBlogImageFile(
  file: Express.Multer.File | undefined,
  maxSizeMb: number = 5
): FileValidationResult {
  if (!file) {
    return { valid: false, error: "Image file is required" };
  }

  if (!file.buffer || file.buffer.length === 0) {
    return { valid: false, error: "Image file is empty" };
  }

  const maxSizeBytes = maxSizeMb * 1024 * 1024;
  if (file.buffer.length > maxSizeBytes) {
    return {
      valid: false,
      error: `Image file size exceeds maximum limit of ${maxSizeMb}MB (received ${(file.buffer.length / (1024 * 1024)).toFixed(2)}MB)`,
    };
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file extension (${ext || "none"}). Only JPG, PNG, and WebP images are accepted`,
    };
  }

  // Check declared MIME type
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Invalid MIME type (${file.mimetype}). Only JPEG, PNG, and WebP images are accepted`,
    };
  }

  // Safe signature check on magic bytes
  const magic = validateImageMagicBytes(file.buffer);
  if (!magic.valid) {
    return {
      valid: false,
      error: "File content does not match a valid JPEG, PNG, or WebP image signature",
    };
  }

  const sanitizedFilename = sanitizeFilename(file.originalname);

  return {
    valid: true,
    sanitizedFilename,
    detectedMimeType: magic.detectedType || file.mimetype,
  };
}

