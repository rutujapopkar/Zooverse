import { sanitizeName } from './sanitizeName'

// Return candidate local src paths for a given animal name using only the exact sanitized name
// Example: Tiger -> tries tiger.png/jpg only (no tigewr); Giraffe -> giraffe only.
export function imageCandidatesForAnimal(name) {
  const slug = sanitizeName(name)
  const title = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : slug
  // Prefer public images (you confirmed all are .jpg), then uploads. Try lowercase and Titlecase filenames.
  return [
    `/images/animals/${slug}.jpg`,
    `/images/animals/${title}.jpg`,
    `/uploads/animals/${slug}.jpg`,
    `/uploads/animals/${title}.jpg`,
  ]
}
