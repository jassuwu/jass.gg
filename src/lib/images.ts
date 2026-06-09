import type { ImageMetadata } from "astro";

// import.meta.glob needs literal patterns, so each asset dir gets its own glob
const blogImages = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/blog/*",
  { eager: true },
);

const projectImages = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/projects/*",
  { eager: true },
);

const ASSET_DIRS = {
  blog: { images: blogImages, base: "/src/assets/blog" },
  projects: { images: projectImages, base: "/src/assets/projects" },
} as const;

export const resolveAssetPath = (
  dir: keyof typeof ASSET_DIRS,
  filename: string | undefined,
): string | null => {
  if (!filename) return null;
  // If it's already a full path (starts with / or http), use as-is
  if (filename.startsWith("/") || filename.startsWith("http")) {
    return filename;
  }

  const { images, base } = ASSET_DIRS[dir];
  const imageModule = images[`${base}/${filename}`];

  if (imageModule) {
    return imageModule.default.src;
  }

  console.warn(`Asset not found: ${dir}/${filename}`);
  return null;
};
