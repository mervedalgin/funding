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
