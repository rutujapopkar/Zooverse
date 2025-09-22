// Utility helpers for normalizing API responses
// Ensures paginated list endpoints shaped like { data: [...], meta: {...} } return an array
export function normalizeList(payload){
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.data)) return payload.data
  return []
}

export function ensureArray(val){
  return Array.isArray(val) ? val : []
}
