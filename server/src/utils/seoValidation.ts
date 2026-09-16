/**
 * SEO Validation Utilities
 * Validates metadata fields and strictly verifies URL safety (http/https only).
 */

export interface ValidatedSeoInput {
  meta_title: string;
  meta_description: string;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
}

export function validateHttpUrl(rawUrl: string, fieldName: string): string {
  if (typeof rawUrl !== "string") {
    const error: any = new Error(`${fieldName} must be a string.`);
    error.status = 400;
    throw error;
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    const error: any = new Error(`${fieldName} cannot be empty or whitespace.`);
    error.status = 400;
    throw error;
  }

  // Reject obvious dangerous prefixes before URL parser
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("file:") ||
    lower.startsWith("vbscript:")
  ) {
    const error: any = new Error(`${fieldName} contains an illegal URL protocol.`);
    error.status = 400;
    throw error;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    const error: any = new Error(`${fieldName} must be a valid absolute HTTP or HTTPS URL.`);
    error.status = 400;
    throw error;
  }

  const protocol = parsed.protocol.toLowerCase();
  if (protocol !== "http:" && protocol !== "https:") {
    const error: any = new Error(`${fieldName} must use http:// or https:// scheme.`);
    error.status = 400;
    throw error;
  }

  return trimmed;
}

export function validateSeoPayload(payload: any): ValidatedSeoInput {
  if (!payload || typeof payload !== "object") {
    const error: any = new Error("SEO payload must be an object.");
    error.status = 400;
    throw error;
  }

  // meta_title: required, trimmed, max 60 chars
  const rawMetaTitle = payload.meta_title ?? payload.metaTitle;
  if (rawMetaTitle === undefined || rawMetaTitle === null) {
    const error: any = new Error("meta_title is required.");
    error.status = 400;
    throw error;
  }
  if (typeof rawMetaTitle !== "string") {
    const error: any = new Error("meta_title must be a string.");
    error.status = 400;
    throw error;
  }
  const meta_title = rawMetaTitle.trim();
  if (!meta_title) {
    const error: any = new Error("meta_title cannot be empty or whitespace.");
    error.status = 400;
    throw error;
  }
  if (meta_title.length > 60) {
    const error: any = new Error(`meta_title must not exceed 60 characters (currently ${meta_title.length}).`);
    error.status = 400;
    throw error;
  }

  // meta_description: required, trimmed, max 160 chars
  const rawMetaDesc = payload.meta_description ?? payload.metaDescription;
  if (rawMetaDesc === undefined || rawMetaDesc === null) {
    const error: any = new Error("meta_description is required.");
    error.status = 400;
    throw error;
  }
  if (typeof rawMetaDesc !== "string") {
    const error: any = new Error("meta_description must be a string.");
    error.status = 400;
    throw error;
  }
  const meta_description = rawMetaDesc.trim();
  if (!meta_description) {
    const error: any = new Error("meta_description cannot be empty or whitespace.");
    error.status = 400;
    throw error;
  }
  if (meta_description.length > 160) {
    const error: any = new Error(`meta_description must not exceed 160 characters (currently ${meta_description.length}).`);
    error.status = 400;
    throw error;
  }

  // og_title: optional, if supplied trimmed max 60 chars, reject empty after trim
  let og_title: string | null = null;
  const rawOgTitle = payload.og_title ?? payload.ogTitle;
  if (rawOgTitle !== undefined && rawOgTitle !== null) {
    if (typeof rawOgTitle !== "string") {
      const error: any = new Error("og_title must be a string.");
      error.status = 400;
      throw error;
    }
    const trimmed = rawOgTitle.trim();
    if (!trimmed) {
      const error: any = new Error("og_title cannot be empty or whitespace if supplied.");
      error.status = 400;
      throw error;
    }
    if (trimmed.length > 60) {
      const error: any = new Error(`og_title must not exceed 60 characters (currently ${trimmed.length}).`);
      error.status = 400;
      throw error;
    }
    og_title = trimmed;
  }

  // og_description: optional, if supplied trimmed max 160 chars, reject empty after trim
  let og_description: string | null = null;
  const rawOgDesc = payload.og_description ?? payload.ogDescription;
  if (rawOgDesc !== undefined && rawOgDesc !== null) {
    if (typeof rawOgDesc !== "string") {
      const error: any = new Error("og_description must be a string.");
      error.status = 400;
      throw error;
    }
    const trimmed = rawOgDesc.trim();
    if (!trimmed) {
      const error: any = new Error("og_description cannot be empty or whitespace if supplied.");
      error.status = 400;
      throw error;
    }
    if (trimmed.length > 160) {
      const error: any = new Error(`og_description must not exceed 160 characters (currently ${trimmed.length}).`);
      error.status = 400;
      throw error;
    }
    og_description = trimmed;
  }

  // canonical_url: optional, if supplied trimmed must be valid absolute http/https URL
  let canonical_url: string | null = null;
  const rawCanonical = payload.canonical_url ?? payload.canonicalUrl;
  if (rawCanonical !== undefined && rawCanonical !== null) {
    canonical_url = validateHttpUrl(rawCanonical, "canonical_url");
  }

  // og_image_url: optional, if supplied trimmed must be valid absolute http/https URL
  let og_image_url: string | null = null;
  const rawOgImage = payload.og_image_url ?? payload.ogImageUrl;
  if (rawOgImage !== undefined && rawOgImage !== null) {
    og_image_url = validateHttpUrl(rawOgImage, "og_image_url");
  }

  return {
    meta_title,
    meta_description,
    og_title,
    og_description,
    og_image_url,
    canonical_url,
  };
}
