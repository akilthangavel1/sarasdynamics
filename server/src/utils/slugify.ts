/**
 * Utility to generate URL-safe slugs from strings
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove non-word characters
    .replace(/[\s_-]+/g, "-") // replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // trim hyphens
}
