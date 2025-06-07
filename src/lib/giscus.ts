/**
 * Giscus configuration for the blog comments system
 *
 * This configuration matches the setup from the GitHub repository
 * and uses the custom theme from the repository.
 */

export const GISCUS_CONFIG = {
  // Repository configuration - must match your GitHub repository
  repo: "jassuwu/jass.gg",
  repoId: "R_kgDOOurgwA",

  // Discussion category - using "blog" category
  category: "blog",
  categoryId: "DIC_kwDOOurgwM4CrJkA",

  // Mapping method - use pathname for automatic mapping
  mapping: "pathname",

  // Strict mode - enabled for better security
  strict: true,

  // Features
  reactionsEnabled: true,
  emitMetadata: true,

  // UI configuration
  inputPosition: "top" as const,
  lang: "en",
  loading: "lazy" as const,

  // Custom theme URL using jsdelivr CDN for proper MIME type
  theme:
    "https://cdn.jsdelivr.net/gh/jassuwu/jass.gg@main/src/styles/giscus.min.css",

  // Script source
  src: "https://giscus.app/client.js",
} as const;

/**
 * Generate giscus script attributes from configuration
 * This ensures consistency and makes it easier to update settings
 */
export function getGiscusAttributes() {
  return {
    src: GISCUS_CONFIG.src,
    "data-repo": GISCUS_CONFIG.repo,
    "data-repo-id": GISCUS_CONFIG.repoId,
    "data-category": GISCUS_CONFIG.category,
    "data-category-id": GISCUS_CONFIG.categoryId,
    "data-mapping": GISCUS_CONFIG.mapping,
    "data-strict": GISCUS_CONFIG.strict ? "1" : "0",
    "data-reactions-enabled": GISCUS_CONFIG.reactionsEnabled ? "1" : "0",
    "data-emit-metadata": GISCUS_CONFIG.emitMetadata ? "1" : "0",
    "data-input-position": GISCUS_CONFIG.inputPosition,
    "data-theme": GISCUS_CONFIG.theme,
    "data-lang": GISCUS_CONFIG.lang,
    "data-loading": GISCUS_CONFIG.loading,
    crossorigin: "anonymous",
    async: true,
  };
}

export type GiscusConfig = typeof GISCUS_CONFIG;
