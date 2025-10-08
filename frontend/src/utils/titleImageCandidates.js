import { sanitizeName } from './sanitizeName'

// Build concise candidate image paths for a title.
// Usage:
//  titleImageCandidates('Tiger Health Milestone', 'news')
//  titleImageCandidates('Night Safari Pilot', ['events'], { includeWebp:false })
//  titleImageCandidates(title, { includeWebp:true }) // folders default to ['news']
export function titleImageCandidates(title, folders = ['news'], options = {}) {
  if(!title) return []
  // Support flexible param ordering where second arg may be options object
  if(!Array.isArray(folders) && typeof folders === 'object') {
    options = folders
    folders = ['news']
  }
  if(typeof folders === 'string') folders = [folders]
  const { includeWebp = true } = options
  const { hyphenated, collapsed } = sanitizeName(title)
  const slug = hyphenated || collapsed
  if(!slug) return []
  // Try .jpeg before .jpg because many legacy exported images use .jpeg
  const exts = ['jpeg', 'jpg']
  if(includeWebp) exts.push('webp')
  const out = []
  for(const folder of folders){
    for(const ext of exts){
      out.push(`/images/${folder}/${slug}.${ext}`)
    }
  }
  // Fallback: legacy 'extra images' directory (space must be encoded in URL)
  for(const ext of exts){
    out.push(`/extra%20images/${humanizeSlug(slug)}.${ext}`)
  }
  // Also attempt .jpeg specifically for legacy files named with .jpeg
  out.push(`/extra%20images/${humanizeSlug(slug)}.jpeg`)
  // Original title encoded (handles kept characters like & that might exist in legacy filenames)
  const encodedOriginal = encodeURIComponent(title)
  // Try both raw and with plus replacement of spaces (some systems export like %20 vs +)
  out.push(`/extra%20images/${encodedOriginal}.jpeg`)
  out.push(`/extra%20images/${encodedOriginal}.jpg`)
  out.push(`/extra%20images/${title.replace(/ /g,'+')}.jpeg`)
  out.push(`/extra%20images/${title.replace(/ /g,'+')}.jpg`)
  return out
}

// Convert hyphenated slug back to Title Case words for matching existing filenames like "Tiger Health Milestone.jpeg"
function humanizeSlug(slug){
  return slug.split('-').map(w=> w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}
