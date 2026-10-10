# Homepage first-house restoration

- Date: 2026-10-10.
- Target: homepage exterior only; no interior or game backgrounds.
- Owner's correction: "i wnat the first house not the one currently up there".
- Candidate: the earlier green-gray, three-gabled house with orange-lit windows,
  using the existing [prepared illustration](../../../assets/estate-cartoon-manor.png)
  and measured placement from revision `040e240`.
- Preserve: [the replaced live version](../../snapshots/README.md), other
  page/game behavior, path/gate alignment, controls, and the saved
  [layout-and-density reference](composition-baseline.md).
- Status: implemented locally using the saved first detailed house as the
  interpretation of the owner's correction. The optional image-confirmation
  question was unanswered; do not claim the owner selected that displayed
  preview. Publication has not been requested or performed.

## Changes

- Restore the earlier house at its original `517 x 600` size and `1080, 240`
  placement. Do not stretch it, splice wings, or invent different architecture.
- Restore the correctly aligned single-window candle/shadow effect and its
  original 25-second shadow motion. Remove the replacement's six-window
  lighting coordinates rather than leaving lights floating over the old house.
- Retain the surrounding graveyard, trees, moon, bats, storm, and entrance
  sequence. This restoration does not claim to finish every density/detail
  improvement from the reference.
- Update the changed scene/module/stylesheet cache tags and artwork credits.

## Verification

- Focused tests: seven passed after restoring the house, including native
  image dimensions, aspect ratio, front-step alignment, and calculated full
  house bounds at both camera endpoints across six desktop/mobile viewports
  (`320 x 844` through `1920 x 1080`). These are geometry checks, not a rendered
  visual approval.
- The restored PNG matches the `040e240` Git blob exactly.
- Browser tests updated to the restored image, native entrance measurements,
  aspect ratio, single-window shadow, and desktop/mobile full-house bounds.
- Browser rerun and a new rendered preview require a safe memory budget; free
  physical memory fell below the project's 4 GB pause threshold.
- No changes to source image bytes or protected historical snapshots.
- The owner subsequently authorized test-site publication and established
  explicit final approval before any `.com` promotion. This restoration is
  being committed for GitHub Pages review only; `production` must remain at
  its previous revision.
