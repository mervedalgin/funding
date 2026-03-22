/**
 * Returns an optimized image URL using Supabase Storage image transformations.
 * For non-Supabase URLs, returns the original URL unchanged.
 */
export function getOptimizedImageUrl(
  url: string | null,
  width: number,
  height: number
): string | null {
  if (!url) return null
  if (!url.includes('supabase.co/storage')) return url

  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}width=${width}&height=${height}&resize=cover&format=webp`
}

/** Target dimensions for donation/need images */
export const IMAGE_TARGET_WIDTH = 1200
export const IMAGE_TARGET_HEIGHT = 600
export const IMAGE_MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
export const IMAGE_QUALITY = 0.85

/**
 * Resizes and converts an image file to WebP at 1200x600 (2:1 ratio).
 * Uses canvas for client-side processing — no server needed.
 * Returns a File object ready for upload.
 */
export async function processImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const { width: srcW, height: srcH } = bitmap

  const targetW = IMAGE_TARGET_WIDTH
  const targetH = IMAGE_TARGET_HEIGHT
  const targetRatio = targetW / targetH

  // Crop to target ratio (center crop), then resize
  let cropW = srcW
  let cropH = srcW / targetRatio
  let cropX = 0
  let cropY = 0

  if (cropH > srcH) {
    cropH = srcH
    cropW = srcH * targetRatio
    cropX = (srcW - cropW) / 2
  } else {
    cropY = (srcH - cropH) / 2
  }

  const canvas = new OffscreenCanvas(targetW, targetH)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH)
  bitmap.close()

  // Try WebP first, fall back to JPEG
  let blob: Blob
  try {
    blob = await canvas.convertToBlob({ type: 'image/webp', quality: IMAGE_QUALITY })
  } catch {
    blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: IMAGE_QUALITY })
  }

  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg'
  const name = file.name.replace(/\.[^.]+$/, '') + '.' + ext

  return new File([blob], name, { type: blob.type })
}

/**
 * Processes an image file and returns both the processed File and a preview data URL.
 */
export async function processImageWithPreview(file: File): Promise<{ file: File; previewUrl: string }> {
  const processed = await processImage(file)
  const previewUrl = URL.createObjectURL(processed)
  return { file: processed, previewUrl }
}
