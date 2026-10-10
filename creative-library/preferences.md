# Design preferences

## Confirmed by the owner on 2026-10-10

- Initially, save the house currently live on the site before future work.
  That version is archived; the owner's later correction below supersedes
  keeping it as the active homepage house.
- The owner liked an earlier house animation. A width request resulted in a
  changed house rather than preserving/rebuilding the same design approach.
- Preserve the established house design when making the requested adjustment;
  do not treat a width request as permission to substitute a different house.
- Save creative elements and research so future animations can reuse them.
- Make the research/design process repeatable and improve it from the owner's
  actual choices over time.
- Ask clarifying questions to avoid unwanted design changes.
- Store this workflow and its preferences in this Grim Gatherings project.
- The supplied [main-page reference image](projects/main-page-animation/composition-baseline.md)
  is the baseline for layout, density, and scene elements, not merely general
  inspiration. The owner reconfirmed this at 09:45 on 2026-10-10.

## Latest house correction during the homepage fix

The owner explicitly corrected the target: "i wnat the first house not the one
currently up there". Preserve the replacement in its archive, but restore the
earlier house rather than treating the replacement as the approved focal artwork.

The restoration candidate uses the existing green-gray, three-gabled
[earlier detailed house](../assets/estate-cartoon-manor.png) from `040e240`,
including its window-aligned candle/shadow effect. A question confirming that
exact image was not answered because the owner was unavailable. Do not invent
that confirmation; keep publication pending review. Do not infer approval to
stretch, splice, or otherwise redesign the restored house.

## Main-page baseline: two separate responsibilities

### New confirmed direction at 10:04 on 2026-10-10

The owner said they like the restored house, but it must be dismantled and
rebuilt from scratch a bit wider. Its shadow should move through all windows
randomly. This confirms the first-house selection and explicitly authorizes
reconstruction; it supersedes the earlier pending-identification wording.

Preserve its three-gabled identity, detailed aged green-gray surfaces, and
orange-lit windows. A roughly 14% width increase was an implementation target,
not an owner-specified measurement. Two bitmap reconstruction experiments
failed visual inspection (distorted columns and repeated joint seams) and
were discarded. Width reconstruction is not complete.

The implemented shadow candidate visits all seven facade windows in a shuffled
bag, reshuffled each minute, with no immediate repeat across cycles. It stays
clipped to window openings and disappears while changing floors. Existing
effects-off/reduced-motion behavior remains. See the
[work record](projects/main-page-animation/rebuild-and-shadow.md).

### Local editing permission and progress

The owner subsequently authorized installing a local image editor. GIMP was
installed; this is not permission to upload artwork to an external service
or to promote changes to production. The approved PNG is preserved unchanged
in [an editable nine-region document](projects/main-page-animation/working/first-house-components.xcf),
with a reproducible, lossless preparation script. These are cutouts of visible
source pixels, not recovered original painting layers.

A new connecting-wall/roof experiment was also rejected after still inspection.
Do not treat installing an editor or preparing source layers as completing the
wider rebuild. Memory recovered sufficiently for sequential Chromium/WebKit
checks, which passed for the shadow; architectural reconstruction remains
unfinished because its visual quality has not passed review.

- Keep the replaced live version archived, and use the earlier house for the
  restoration candidate as requested in the latest correction.
- Use the saved reference image to guide the surrounding composition and
  density: a prominent mansion, large trees framing both edges, a layered
  graveyard with varied monuments, low fog, and a populated storm sky.
- The owner's selection confirms the image's compositional role. It does not
  authorize replacing the live house with the depicted mansion, extracting
  reference artwork, changing animation timing, or deploying a redesign.
- Specific spatial observations and review criteria are recorded beside the
  image. They are interpretations of visible composition, not newly approved
  pixel coordinates, exact object counts, or motion requirements.

## Page-specific scene direction confirmed at 09:49 on 2026-10-10

| Area | Owner's direction | Scope/status |
|---|---|---|
| Main page / first impression | Exterior house animation, using the supplied layout/density baseline | Restore the earlier house; keep the replacement archived; the reference applies here only |
| Create-a-game section | Background changes to an animated scene that feels like being inside the house | Interior direction confirmed; exact room, assets, composition, motion, and transition not yet selected |
| Individual games | Every game has a different animated background | Future work, not built yet; use each game's own setting/story and design brief |
| Other pages | Backgrounds may change to fit their page | No universal exterior composition; specific scenes remain to be defined |

The shared standard is the research/design quality process, not identical
artwork, density, colors, weather, gates, graves, or entrance behavior on every
page. Treat the intended exterior-to-interior change as navigation context;
a continuous camera trip or particular transition effect has not been selected.

This clarification records the roadmap. It does not request building those
future animations now or assert that any future scene is already implemented.

## Existing project direction, not a newly confirmed selection

The [existing animation guide](../BACKGROUND-ANIMATION-GUIDE.md) describes detailed
gothic cartoon illustration, cohesive supporting artwork, complete iron gates,
candlelight, low fog, rain, and storm atmosphere. It documents layered 2D depth,
one-time arrival, and continuing weather. Reuse that implementation knowledge;
its historical approval wording does not resolve which earlier house the owner
means now.

## Still unresolved

- Which exact earlier version is the favorite? The archived detailed estate at
  `040e240` is a candidate, not a confirmed selection. Earlier versions also
  exist in Git history.
- Does "wider" mean more visible estate/landscape, a larger house on screen, or
  changed architectural width?
- Which features of the favorite must never change: silhouette, towers/windows,
  palette, detailed illustration, camera path, gates, or other features?
- How should alternatives be reviewed: stills first, short animation previews,
  or side-by-side comparisons?

The follow-up question about preserving every unrequested detail could not be
answered because the owner was unavailable. Do not mark it as an explicit
selection. The safe working default is to protect historical snapshots, follow the latest
earlier-house restoration request, and obtain exact visual confirmation before
publishing. Do not revert to keeping the replacement as the selected house.

## Release policy confirmed at 09:59 on 2026-10-10

All changes and tests go to the GitHub Pages test website for owner review
first. The `.com` site requires explicit final approval before promotion.
The owner authorized publishing this house restoration to the test website,
not production. Follow the
[release approval instructions](../.github/instructions/release-approval.instructions.md).

## Future learning

Keep dated decisions in each [project brief](templates/design-brief.md), including
the owner's words, selected version, reason, and scope. Add a general preference
here only after confirmation. Do not extrapolate one story's creative choice
into a universal rule without checking.
