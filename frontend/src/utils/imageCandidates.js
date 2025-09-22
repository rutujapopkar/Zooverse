// Extremely conservative candidate generator to avoid floods of 404s.
// We now ONLY try the exact animal name with .jpg then .jpeg. Nothing else.
// Any broader guessing (lowercase/collapsed/uploads) created a lot of failed requests.
export function imageCandidatesForAnimal(name) {
  if(!name) return []
  const original = String(name)
  return [
    `/images/animals/${original}.jpeg`,
    `/images/animals/${original}.jpg`
  ]
}
