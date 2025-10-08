// Extremely conservative candidate generator to avoid floods of 404s.
// We now ONLY try the exact animal name with .jpg then .jpeg. Nothing else.
// Any broader guessing (lowercase/collapsed/uploads) created a lot of failed requests.
export function imageCandidatesForAnimal(name) {
  if(!name) return []
  const original = String(name)
  // Build a small set of reasonable filename variants to try.
  // Keep this list conservative to avoid flooding dev server with 404s.
  const lower = original.toLowerCase()
  const title = original.charAt(0).toUpperCase() + original.slice(1)
  const collapsed = lower.replace(/[^a-z0-9]/g, '')
  const candidates = []

  // Prefer images in /images/animals using common extensions
  for (const base of [original, lower, title, collapsed]) {
    candidates.push(`/images/animals/${base}.jpg`)
    candidates.push(`/images/animals/${base}.jpeg`)
  }

  // Fallback locations (uploads) where admin uploads might be stored
  for (const base of [lower, title, collapsed]) {
    candidates.push(`/uploads/animals/${base}.jpg`)
    candidates.push(`/uploads/animals/${base}.jpeg`)
  }

  // Legacy/extra images folder uses Title Case words with spaces (encoded URL path)
  const humanized = collapsed ? collapsed.replace(/([a-z0-9])([A-Z])/g, '$1 $2') : (original)
  candidates.push(`/extra%20images/${title}.jpg`)
  candidates.push(`/extra%20images/${title}.jpeg`)

  // Remove duplicates while preserving order
  return Array.from(new Set(candidates.filter(Boolean)))
}
