Title-based image naming rules (simplified to minimize 404 requests)
===================================================================

We generate only a small, deterministic set of candidate paths now.

For each title we derive a hyphenated lowercase slug:
  "New Giraffe Enclosure Opens" -> new-giraffe-enclosure-opens
  "Conservation Talk Series" -> conservation-talk-series
  "Tiger Health Milestone" -> tiger-health-milestone
  "Night Safari Pilot" -> night-safari-pilot
  "Vet Q&A Session" -> vet-q-a-session
  "Enrichment Workshop" -> enrichment-workshop
  "Kids Conservation Quiz" -> kids-conservation-quiz
  "Monsoon Wetland Walk" -> monsoon-wetland-walk
  "Big Cat Awareness Week" -> big-cat-awareness-week
  "Sustainable Safari Initiative" -> sustainable-safari-initiative

Place images in their respective folder with .jpg (preferred) or optional .webp:
  /images/news/new-giraffe-enclosure-opens.jpg
  /images/news/conservation-talk-series.jpg
  /images/news/tiger-health-milestone.jpg

  /images/events/night-safari-pilot.jpg
  /images/events/vet-q-a-session.jpg
  /images/events/enrichment-workshop.jpg
  /images/events/kids-conservation-quiz.jpg

  /images/campaigns/monsoon-wetland-walk.jpg
  /images/campaigns/big-cat-awareness-week.jpg
  /images/campaigns/sustainable-safari-initiative.jpg

Fallback:
  If the specific image is missing the component will finally load:
    /images/placeholder-banner.svg

Add your real images (ideally 1280x720 or similar 16:9) and keep file sizes reasonable (<300KB) for performance.
