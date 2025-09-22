Title-based media naming guide
================================
Place images for news, events, and campaigns using BOTH of these slug styles so automatic lookup succeeds:

1. Hyphenated slug: lowercase words joined by hyphen
   Example: "New Giraffe Enclosure Opens" -> new-giraffe-enclosure-opens.jpg
2. Collapsed slug: lowercase alphanumerics concatenated
   Example: newgiraffeenclosureopens.jpg

Supported folders (checked in this order):
  /images/news
  /images/events
  /images/campaigns
  (then fallback: /images)

Supported extensions (searched in order): .jpg .jpeg .png .webp

Minimal recommendation: provide a .jpg with EITHER hyphenated or collapsed form in the matching folder.
Better: add both variants if you want to be safe during any future naming changes.

Examples you can add now:
  images/news/new-giraffe-enclosure-opens.jpg
  images/news/conservation-talk-series.jpg
  images/news/tiger-health-milestone.jpg
  images/events/night-safari-pilot.jpg
  images/events/vet-q-a-session.jpg (or veta-session depending on final sanitize rules)
  images/events/enrichment-workshop.jpg
  images/events/kids-conservation-quiz.jpg
  images/campaigns/monsoon-wetland-walk.jpg
  images/campaigns/big-cat-awareness-week.jpg
  images/campaigns/sustainable-safari-initiative.jpg

If your file manager auto-capitalizes, keep everything lowercase to avoid case issues in production (Linux is case-sensitive).
