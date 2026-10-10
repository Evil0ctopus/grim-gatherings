# Wider first-house rebuild and randomized shadow

## Request

On 2026-10-10 at 10:04 the owner confirmed liking the restored first house,
requested dismantling/rebuilding it slightly wider, and asked for shadow
movement through all windows randomly. The homepage only is in scope.
Production still requires final approval.

## Width: unfinished, not published

The first local attempt separated the three detailed bays and expanded the
connecting strips by 55 native pixels each, targeting 886 x 900 instead of
776 x 900 (+14.2% width). Direct image inspection showed distorted carved
columns. A second attempt retained the columns and used repeated wall-joint
samples; inspection showed obvious repeated seams and broken roof continuity.
Both candidates and their temporary processing script were removed.

Neither qualifies as the requested high-quality rebuild from scratch.
Do not reuse these strip-expansion shortcuts or claim the house is wider.
The intact original remains the runtime artwork and its archive is unchanged.
A faithful reconstruction needs individually prepared architectural components
and continuous new wall/roof artwork, with a rendered visual comparison before
test-site publication. Memory pressure currently prevents browser review.

## Randomized shadow: implemented

- Seven facade window openings are mapped: three upper, two middle, two lower.
  Door glass is not a facade window.
- A Fisher-Yates shuffled bag visits every window once in each 60-second cycle.
  The order is regenerated on every cycle; its first window cannot repeat the
  previous cycle's last.
- One normalized silhouette changes scale for each opening. Its dark shape
  passes across that window and is hidden before moving between windows/floors.
- The SVG clip uses the same measured paths as the window-light overlays.
- Initialization happens after the homepage is inserted. Animation listeners
  belong to the scene, with no interval, global observer, or background timer.
  Removing the scene removes its animation; re-entering creates a fresh order.
- CSS effects-off and reduced-motion rules disable shadow motion as before.

## Verification and scope

Nine focused tests pass, covering 100 reproducible randomized cycles, full
coverage, differing orders, cycle-boundary repeat prevention, hidden travel,
per-window scaling/positions, mounted-cycle renewal, accessibility rules,
house proportions, entrance alignment, and six viewport framing calculations.
Browser tests are updated but have not been rerun: free physical memory was
below the 4 GB pause threshold and reached approximately 1.6 GB.

Only the shadow candidate is suitable for test-site review. The width request
remains incomplete and must not be represented as delivered.
