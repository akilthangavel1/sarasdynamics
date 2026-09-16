import sanitizeHtml from "sanitize-html";

/**
 * Sanitizes rich HTML content to prevent Stored XSS attacks while preserving
 * standard typography, headings, lists, formatting, blockquotes, and code blocks.
 */
export function sanitizeBlogContent(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== "string") {
    return "";
  }

  return sanitizeHtml(dirtyHtml, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "div", "span", "br", "hr",
      "strong", "b", "em", "i", "u", "strike", "s", "sub", "sup",
      "ul", "ol", "li",
      "blockquote", "pre", "code",
      "table", "thead", "tbody", "tr", "th", "td", "caption",
      "a", "img",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      "*": ["class", "id"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
    },
    transformTags: {
      a: (tagName, attribs) => {
        const cleanHref = (attribs.href || "").trim();
        // If external link, force safe rel
        if (cleanHref.startsWith("http://") || cleanHref.startsWith("https://")) {
          return {
            tagName: "a",
            attribs: {
              ...attribs,
              target: "_blank",
              rel: "noopener noreferrer",
            },
          };
        }
        return { tagName: "a", attribs };
      },
    },
  });
}

/**
 * Generates URL-safe lowercase slug from arbitrary title string.
 */
export function slugify(text: string): string {
  if (!text || typeof text !== "string") {
    return "post";
  }

  const slug = text
    .toString()
    .toLowerCase()
    .trim()
    // Replace accented characters with standard ASCII equivalents
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Remove invalid characters
    .replace(/[^a-z0-9\s-]/g, "")
    // Replace whitespace and underscores with hyphens
    .replace(/[\s_]+/g, "-")
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/-+/g, "-")
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, "");

  return slug || "post";
}
