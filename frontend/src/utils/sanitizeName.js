// Returns an object with two variants:
// collapsed: removes all non-alphanumerics
// hyphenated: replaces groups of non-alphanumerics with single hyphen (no leading/trailing hyphen)
export function sanitizeName(name) {
  const base = String(name || '').toLowerCase().normalize('NFKD')
  const collapsed = base.replace(/[^a-z0-9]/g, '')
  const hyphenated = base
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return { collapsed, hyphenated }
}
