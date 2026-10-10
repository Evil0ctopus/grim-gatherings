# Grim Gatherings background animation guide

This documents the approved homepage animation and provides instructions for
repeating its approach on other pages. It does not change any live page.

## Current test candidate: 2026-10-10

The owner accepted the third, weathered Microsoft Copilot-generated wider
house with "i like it", then confirmed generate/review/refine/save as the
workflow for every new animation image element. The homepage candidate uses
`assets/estate-generated-manor.png` (1080 x 747) at `978,315`, displayed
720 x 498 without distortion. This is a new accepted interpretation, not an
exact reconstruction of the first house. Its display width is 39.3% greater
than the previous 517-pixel artwork; that measurement is an implementation
result, not an owner-specified percentage.

The original generated PNG, lossless transparent cutout, reproducible GIMP
recipe, source terms, decisions, and desktop/mobile stills are saved in the
[project record](creative-library/projects/main-page-animation/rebuild-and-shadow.md).
The original house remains unchanged. Seven remapped window masks cover the
lower glass panes only, excluding center mullions and decorative arches.
The shuffled shadow still renews each minute with invisible travel and no
immediate cycle-boundary repeat. Existing scenery, gates, controls, and
one-time arrival are retained.

Test-site publication is authorized; `.com` requires separate explicit approval
of the exact reviewed commit. Interior and game scenes are not built by this
change. Historical descriptions below document earlier versions, not current
selection or permission to substitute their artwork again.

## Historical restoration update: 2026-10-10

The subsequent shadow update maps all seven windows and shuffles their visit
order anew every minute, without immediately repeating the last window of the
previous cycle. The silhouette is clipped to the window openings and invisible
while changing floors. The owner also requested a wider reconstruction, but
the inspected bitmap experiments were rejected; the house itself is not wider.
See the [rebuild/shadow work record](creative-library/projects/main-page-animation/rebuild-and-shadow.md).

The owner subsequently requested the first house rather than the replacement.
The local restoration candidate now uses `assets/estate-cartoon-manor.png` at
the earlier `1080, 240` placement and `517 x 600` size, with its original
window-aligned 25-second passing shadow. Newer surrounding graveyard, tree,
moon, bat, storm, control, and one-time arrival layers remain intact.

The sections below retain the history of the replacement and its preparation;
they are not authority to substitute it again. The replacement is preserved
unchanged in the creative-library snapshots. Exact first-house identification
and publication approval remain pending owner review. See the current
[restoration brief](creative-library/projects/main-page-animation/restoration-brief.md).

## 1. What we built

The homepage is a **layered 2D illustration with simulated depth**, not a video
or a true 3D scene. Detailed sourced artwork supplies the mansion, tree and
ironwork; SVG supplies the connected scenery; CSS supplies movement and weather.

The intended feel is detailed gothic cartoon artwork, a distant house behind
complete iron gates, candlelight, low fog, rain and a dark storm sky. It must
look like one cohesive illustration, not a detailed house surrounded by cheap
clip art.

The entrance plays once per loaded page: the gates open, the camera slowly
approaches the house and the foreground gateway fades away. Weather and subtle
window activity continue. Returning home within the same loaded application
does not replay the entrance; a full reload starts a new visit.

## 2. Existing implementation to reuse

| File | Responsibility |
|---|---|
| [js/manor.js](js/manor.js) | `hauntedManorHtml()`, SVG scenery, artwork placement, driveway geometry, gates, trees and lanterns |
| [css/style.css](css/style.css) | `.manor-*` styles, keyframes, home layout, mobile composition and accessibility overrides |
| [js/host.js](js/host.js) | Imports the scene and inserts it inside `#app` in `renderLanding()` |
| [js/atmosphere.js](js/atmosphere.js) | Ambience controls, effects preference, reduced-motion detection, phase/theme integration and audio lifecycle |
| [js/ambient.js](js/ambient.js) | Recorded ambience playback; separate from the visual animation |
| [index.html](index.html) | Shared stylesheet and application entry point |
| [how-to-play.html](how-to-play.html#image-credits) | Artwork credits, source links, adaptations and license disclosures |
| [tests/manor.mjs](tests/manor.mjs) | Structural, asset, alignment and cache-tag checks |
| [tests/manor-e2e.mjs](tests/manor-e2e.mjs) | Chromium/WebKit checks for composition, lightning, controls and one-time arrival |

Do not copy the entire host/game application just to add a background to an
information, account or shop page.

## 3. Artwork and sourcing

The current scene uses these bundled assets:

| Asset | Use |
|---|---|
| [assets/estate-complete-manor.png](assets/estate-complete-manor.png) | Complete detailed house, proportionally resized and color-graded |
| [assets/estate-cartoon-manor.png](assets/estate-cartoon-manor.png) | Earlier approved house and source of the retained pillar texture |
| [assets/estate-withered-tree.png](assets/estate-withered-tree.png) | Detailed tree, reused and mirrored |
| [assets/estate-illustrated-gate.png](assets/estate-illustrated-gate.png) | Ornamental detail inset inside complete generated gate frames |
| [assets/estate-stone-pillar.png](assets/estate-stone-pillar.png) | Subtle masonry texture, not a stretched full-height pillar |
| [assets/estate-candle.svg](assets/estate-candle.svg) | Flame artwork inside sheltered lanterns and beside the title |
| [assets/fog.svg](assets/fog.svg) | Repeating textured fog |

Verified source pages recorded in the credits:

- Mansion: <https://pixabay.com/illustrations/haunted-mansion-spooky-house-9805270/>
- Complete replacement house by PixelLabs: <https://pixabay.com/illustrations/haunted-house-abandoned-house-9859927/>
- Tree: <https://pixabay.com/illustrations/withered-tree-dead-tree-9379381/>
- Gate ornament by Art_Dreams:
  <https://pixabay.com/illustrations/haunted-house-gate-stairway-manor-7570954/>
- License summary: <https://pixabay.com/service/license-summary/>

These source illustrations are labeled AI-generated. They were sourced online;
they are not photographs or newly hand-drawn house artwork.

For another setting, choose legally usable, detailed artwork first. Verify its
license and record the source, creator, modifications and any AI disclosure.
Download and bundle approved assets rather than hotlinking remote images.
Remove unwanted background/margins, retain transparency where needed, preserve
aspect ratio and match the scene's color palette. Do not distribute extracted
artwork as standalone stock downloads.

## 4. How we searched, prepared and refined the design

This section was checked against the saved design history as well as the final
source. Earlier experiments are listed as experiments, not instructions to
restore obsolete assets.

### Search process

1. Inspect the current page and its image before searching. The original problem
   was a tightly cropped house with distracting clutter, not merely a lack of
   animation. The brief became a wider estate, a clear front-door approach,
   complete iron gates, candlelight and storm atmosphere.
2. Compare implementation options: layered 2D/2.5D, a pre-rendered 3D scene and
   live 3D. Choose layered scenery so the page can remain responsive, readable
   and lightweight without a new rendering engine.
3. Search for the focal artwork before building the supporting scenery. We
   initially researched real photographs through Wikimedia Commons and checked
   author/license metadata through its public API. Harlaxton Manor, a Hanbury
   Hall gate and a public-domain candle were tried locally. That photographic
   version was superseded when the requested direction became a detailed cartoon
   estate.
4. For the cartoon version, search illustration sources and open the actual
   source pages. Some search results supplied nonexistent asset links; they were
   not accepted as evidence that an image existed or could be used.
5. Compare real candidates visually. The selected Pixabay mansion had a
   transparent, detailed, dimensional appearance. The alternate Art_Dreams
   scene had useful gate ornament but a portrait composition less suitable as
   the whole homepage.
6. Check license, creator, AI labeling and adaptation restrictions on the actual
   pages. Disclose that the illustrations are AI-generated. Obtain approval for
   the selected look before finishing the animation.
7. Search separately for missing supporting elements when the approved house
   makes existing scenery look inferior. A later search found the detailed
   withered-tree illustration used in the final scene.

Useful search phrases for repeating the process (suggested searches, not a
claimed verbatim search transcript):

```text
gothic haunted mansion illustration transparent background
detailed spooky estate cartoon wide composition
ornate wrought iron gate haunted house illustration
withered dead tree illustration transparent
site:pixabay.com/illustrations haunted mansion
site:pixabay.com/illustrations withered tree
```

Search results are leads, not a license check. Always inspect the source page,
downloaded file and rendered result. Do not assume an image is usable because a
search summary calls it "free."

### Local image preparation

Image processing was done locally with PowerShell, `System.Drawing` and
temporary in-process C# helpers. The original processing helpers were not saved
as a reusable script, so this guide records the method rather than pretending
there is a one-command asset pipeline.

- **Mansion:** download the verified PNG; crop transparent margins, preserve the
  building and steps, resize to `776 x 900`, and retain PNG transparency. The
  bundled result is about 1.27 MB. Apply restrained scene color grading in CSS,
  rather than flattening the house into an indistinct black silhouette.
- **Gate ornament:** download the alternate `784 x 1280` illustration. The
  recorded extraction used a `190 x 1080` crop starting at `(70, 170)`. Its
  dark ironwork was separated from the brighter background using luminance-based
  alpha masking, cleaned to remove residual scenery, and recolored green-gray.
  Inspect the alpha/composite visually; a numerical mask alone is insufficient.
  In the final design this is an ornament inside a complete frame, not a
  substitute for the entire fence or gate.
- **Stone texture:** extract a `58 x 150` detail from the mansion at
  `(286, 731)` and mask unwanted surrounding pixels. The first attempt stretched
  a small pillar crop into a large column and looked wrong. The final design
  instead constructs masonry blocks and overlays the sourced texture subtly.
- **Trees:** the intermediate scene used cropped branches from the mansion.
  Those looked too cheap and crowded the house. Replace them with the separately
  sourced withered-tree artwork, scaled down and mirrored where needed. The
  abandoned branch asset was removed from the final project.
- **Candles:** retain the small illustrated flame SVG and build dimensional
  lantern housings around it with metal/glass gradients, highlight strokes and
  amber halos. Eight lantern flames appear in the scene; the title has a
  separate decorative candle.
- **Ground and weather:** use original perspective paving, gradients, SVG noise,
  fog texture and CSS rain rather than seeking a separate stock image for every
  element. Match these generated surfaces to the approved artwork's detail and
  lighting.

Crop coordinates describe the source versions recorded during this project.
Verify downloaded dimensions before reusing them. Inspect transparent cutouts
over the actual dark scene, not only against an image viewer's preview color.
The exact final artwork/geometry is preserved in the bundled assets and renderer.

### Reference-inspired rebuild

The supplied composition reference was inspected for spatial relationships,
not copied into the site. It led to a closer, broader house, large edge trees,
smaller distant trees, foreground/background graves, a full moon, bats and
separate distant strikes.

Two rebuilding experiments were rejected: attaching cropped house wings left
disconnected walls and cut roofs; constructing a facade from generated masonry
and repeated window cutouts looked like clip art. Both were removed. Do not
repeat either approach to widen another scene.

The accepted replacement uses one complete, detailed PixelLabs illustration.
The actual source page was checked for creator, AI-generated labeling and the
Pixabay Content License. The transparent 1280-square PNG was resized uniformly
to 1000-square with System.Drawing's high-quality bicubic interpolation.
No building sections were spliced, and no roof or facade was cropped away.
The original house asset remains as the source of the retained pillar texture.
Discarded experimental texture assets were removed.

Use whole artwork with the correct proportions instead of stretching a narrow
house or trying to manufacture matching detail with simple SVG architecture.
Approval of the complete building comes before final animation and deployment.

### Feedback that determined the final result

| Earlier issue | What changed | Lesson for another page |
|---|---|---|
| Original house too close, with clutter | Use a wider clean composition and a deliberate approach | Choose the right artwork/crop before adding motion |
| First drawn version looked simplistic | Replace the focal house with detailed sourced illustration | Do not try to hide poor artwork behind effects |
| House good, surroundings low quality | Add sourced iron detail, restrained surface texture and shaded lanterns | All visible layers must meet the same quality bar |
| Driveway missed the front steps | Measure the artwork's real entrance and share its anchor | Never position the path and gates independently by eye |
| Gates had gaps and no attached fence | Construct complete frames, pickets, rails, pillars and flanking fences | Decorative cutouts alone are not a complete gateway |
| Trees looked cheap, oversized and crowded | Source a detailed tree, reduce its size and move it outward | Preserve breathing room around the focal building |
| Lightning was not visible | Test opacity/timing and place soft illumination above shading | Verify a visible strike, not just the presence of a keyframe |
| Bolt looked cheap and foreground-like | Make it thin, branching and vertical; hide its lower end behind ground | Depth comes from occlusion and scale, not brightness alone |
| Storm clouds too small or invisible | Expand a textured bank across the sky and mask it above the roof | Reserve sky space for atmosphere without covering the house |

Some intermediate lightning used a shorter foreground-looking fork and
different delays. Those settings were superseded; use the final timing table
below, not the older screenshot's animation values.

### Visual review loop

We rendered the scene in a local browser, captured desktop/mobile screenshots,
looked at individual gate/tree/stone cutouts, and revised specific faults.
Saved review images progressed through cartoon, detail, complete-gate,
distant-tree and cloud-bank versions. The final accepted design was not the
first technically valid result.

For another page:

1. Approve the focal artwork and still composition.
2. Check supporting asset quality and connected geometry.
3. Review entrance-start, entrance-end and lightning-peak frames.
4. Review desktop and mobile crops with real page content visible.
5. Fix the specific rejected element while preserving accepted elements.
6. Run technical checks after visual refinements; a passing test is not a
   substitute for a convincing scene.

Do not delete unrelated files during cleanup. Remove only identified temporary
downloads and task-created obsolete assets after confirming they are unused.

## 5. Layer recipe

The SVG uses a `1920 x 1080` coordinate system. Draw in this order, back to front:

1. Dark sky gradient.
2. Broad sky texture, a cratered moon disk and its halo.
3. Textured storm-cloud bank, masked above the house.
4. Two thin branching vertical lightning paths, behind the scenery.
   A textured cloud crosses the moon and five bats fly through this sky layer.
5. Ground silhouette, which hides the bottom of the distant bolt.
6. Two small distant trees and six distant graves framing the house.
7. Perspective driveway and paving.
8. House artwork.
9. Warm window light and a silhouette clipped to six real window interiors,
   traveling across the upper and ground floors with invisible floor changes.
10. Path lanterns, growing larger toward the viewer.
11. Four larger foreground graves and two much larger edge trees.
12. Complete gateway: fences, masonry pillars, hinged gate leaves and lanterns.

Outside the SVG, overlay these separate decorative elements in order:

1. Moving cloud shadow.
2. Back fog.
3. Front fog.
4. Far rain.
5. Near rain.
6. Dark scene shading for text contrast.
7. Soft lightning illumination, above the shading so it remains visible.

Keep the visible bolt and the soft flash separate. Putting everything behind
the shading makes the lightning disappear; putting the bolt in front of the
house makes it look pasted onto the foreground.

## 6. Geometry: align everything to the actual doorway

The complete house is at `(1009.875, 122.6953125)` with size `750 x 750`.
The approach meets the front steps at `(560, 1173)` in the original
`1280 x 1280` source. Use the same fractions for the resized asset.
The resulting scene-space center is approximately:

```text
doorX = 1009.875 + (560 / 1280) * 750 = 1338
doorY = 122.6953125 + (1173 / 1280) * 750 = 810
shared entrance anchor = (1338, 810)
driveway width at entrance = 76
camera horizontal origin = (1338 / 1920 * 100)% = 69.6875%
camera vertical origin = 32%, retaining more sky during the closer approach
```

The left gate begins at `x=898` and is `440` wide; the right begins at
`x=1338`. Their closed inner edges meet on the doorway centerline. Pillars
begin at `x=768` and `x=1778`, each `130` wide. The left fence begins at
`x=-120`, is `888` wide and meets the left pillar. The right fence begins at
`x=1908`, exactly after the right pillar.

Far trees are centered at `x=810` and `x=1855`, with sizes `360` and `380`.
Near trees are centered at `x=615` and `x=2090`, with sizes `940` and `1000`.
The storm mask ends at `y=144`; the actual roof starts around `y=147`,
after accounting for the artwork's transparent top margin.

For a new house, recalculate these anchors from its actual front steps. Do not
assume the door is at the image's midpoint. Generate the driveway, gate opening,
lantern pairs and camera origin from the same anchor. Check numerical alignment
as well as screenshots.

## 7. Current movement settings

| Effect | Timing and behavior |
|---|---|
| Gate leaves | 9 seconds after a 1-second delay; `scaleX(1)` to `scaleX(.08)`, opposite hinge origins |
| Camera approach | 18 seconds after a 2-second delay; scale `1.02` to `1.14`, once |
| Gateway pass | Same 18-second timeline; scale `1` to `1.26`, fade to zero |
| Candle flames | 3.7-second alternate loop; small scale/rotation/opacity changes |
| Back fog | 38-second alternate transform loop; opacity `.35` |
| Front fog | 27-second reverse-alternate loop; opacity `.45` |
| Far rain | 1.3-second linear loop; opacity `.22` |
| Near rain | `.8`-second linear loop; opacity `.18`, larger pattern |
| Cloud shadow | 40-second alternate loop |
| Window silhouette | 42-second route visiting six windows on two floors; invisible floor transition |
| Moon cloud | 48-second alternate drift |
| Bats | 24-second alternate flight with staggered starts; `.8`-second wing movement |
| Last window light | 47-second loop with a quiet extinguished interval |
| Lightning and flash | Two 12-second loops with delays of 1 and 7 seconds; peaks around 1.18 and 7.18 seconds |

Gate opening is a 2D scale illusion, not an actual 3D hinge. The camera also
uses CSS scaling, not WebGL. This keeps the scene simple and browser-friendly.

The bolt has a `1.5`-unit bright core and a blurred `7`-unit glow. Its
dash-offset animation reveals the path downward. The flash fades instead of
rapidly strobing. The storm cloud texture itself is static; the separate shadow
layer moves.

## 8. Reusing the exact scene versus creating a new setting

### Reuse the same estate

- Import `hauntedManorHtml()` and reuse the bundled artwork and `.manor-*` CSS.
- Mount **one** scene inside an isolated content wrapper. The homepage depends
  on `isolation:isolate` on `main` because the fixed scene uses `z-index:-1`.
- Keep `aria-hidden="true"`, `focusable="false"`, `pointer-events:none` and
  overflow clipping. No links, buttons or meaningful text belong in the scene.
- Leave real headings/forms outside the SVG.
- Do not mark a shop/account/game page as `data-phase=home` simply to inherit
  layout: that attribute also drives atmosphere and audio behavior.
- Add narrowly scoped page styles for the wrapper, contrast and mobile layout.
- Hide competing fog/backdrop layers only on the intended page.
- Existing asset URLs are page-relative (`assets/...`). They work on root-level
  pages and the GitHub project subpath, but need resolving or adjusting if the
  new page lives in a deeper directory.
- SVG definition IDs must be unique if multiple scenes ever share one document.
  Prefer a single instance rather than duplicating the same IDs.

Conceptual placement:

```js
import { hauntedManorHtml } from './manor.js?v=manor-complete-v10';

// In the page's existing renderer, not an extra host/game application:
container.innerHTML = `
  ${hauntedManorHtml()}
  <div class="page-content">${existingPageMarkup}</div>
`;
```

This illustrates placement only. Integrate with the page's existing renderer,
event handlers and trusted markup helpers; do not replace working forms with
this snippet.

### Create a different scene with the same quality

Use the current scene as the reference rather than copying its coordinates
blindly. Keep shared weather, lighting, texture and control patterns; replace
the setting-specific artwork and geometry. Give new SVG IDs and scene-specific
CSS a distinct prefix to avoid changing the homepage.

Suggested adaptations:

- Information pages: quiet exterior, gentle fog and candlelight, no long arrival.
- Shop: detailed gothic display/window, candle-lit merchandise framing, minimal
  weather so prices and buttons stay readable.
- Account pages: restrained lamplit study or foyer with very little motion.
- Game screens: prioritize clue readability; preserve their existing story
  atmosphere and audio phase rules rather than replaying the homepage entrance.

Get approval for new artwork/composition before polishing movement. Do not
automatically put the same dramatic gate entrance on every page.

## 9. Mobile, controls and performance

Desktop uses SVG `preserveAspectRatio="xMidYMid slice"` and keeps the content on
the shaded left while the house occupies the right. At widths up to `780px`,
the current landscape starts at `top:32%`, expands to `width:170%` and shifts
left by `66%`, with a vertical mask. Heading/content become centered.

Treat mobile as a deliberate composition, not a squeezed desktop. Preserve the
house, doorway and useful sky without adding horizontal overflow or covering
forms. A new setting may need different crop values.

Reuse the existing Ambience preferences when the page already has them:

- `body[data-effects=off]`: no animations/transitions; hide fog, rain, moving
  cloud shadow, lightning and bolt; keep a still scene.
- `body[data-motion=reduced]` and OS reduced-motion media query: no movement,
  rain, lightning or bolt; keep static artwork, including still fog where
  applicable.
- Gateway stays visible in the static mode; gates use their resting open pose.
- Do not instantiate `createAtmosphere()` twice. On a page without controls,
  wire the effects preference and OS reduced-motion support intentionally.
  That module creates additional layers, controls and listeners, not just a
  background setting.

Sound is independent: the scene does not play thunder or synchronize a recording
to the CSS strike. Keep mute, volume, interaction-to-start and page lifecycle
handling. Existing home/preparation recordings stop when the lobby opens.
Do not add autoplay sound or start storm audio on account/shop pages by accident.

Prefer transform/opacity animation over layout animation. Keep assets local,
optimize dimensions and check SVG filter cost on mobile. Do not introduce a
3D engine or video just to reproduce this effect.

## 10. Verification and release checklist

- Assets decode correctly and retain transparency; no remote-image dependency.
- Door, driveway and gate opening share a verified centerline.
- Gates have complete frames/rails/pickets and connect to pillars and fences.
- Trees have matching detail, correct scale and breathing room around the house.
- Clouds span enough sky to be visible but cannot overlap the roof.
- Lightning is visible, vertical, distant and behind the scenery; soft flash
  remains visible above the shading.
- Test at `320`, `390`, `768` and `1280` pixels in Chromium and WebKit.
- Check contrast, scrolling, horizontal overflow and actual button/input hits.
- Effects off and reduced motion produce the intended still composition.
- Returning to the page does not restart a one-time arrival unexpectedly.
- Audio controls and gameplay/page behavior remain unchanged.
- Add/update related asset, geometry and browser tests for the new page.

Reference commands from the project root:

```powershell
node --test tests\manor.mjs
node tests\manor-e2e.mjs
npm run test:ui
npm run build:site
npm run build:site -- --production
```

These verify the existing scene; extend the relevant tests to cover a new page.
Update credits for new artwork. If code/styles change, bump the affected
stylesheet/module cache tags and their importing entry points, including
matching test expectations. The shared stylesheet uses `gothic-ui-v1` on all
public pages. The home entry/import chain uses `manor-complete-v10`;
unchanged player and policy modules retain
`all-games-v1`.

Commit, push and deploy only when requested. Check both website builds and
verify the actual deployed assets and page behavior, not just a successful build.

## 11. Copyable implementation request

> Adapt the approved Grim Gatherings homepage background approach to
> [TARGET PAGE]. Use BACKGROUND-ANIMATION-GUIDE.md and the existing manor scene
> as the implementation reference. Preserve the current homepage and all target
> page functionality. Use detailed licensed, locally bundled illustration
> artwork with matching-quality scenery, shared geometry anchors, candlelight,
> layered low fog and restrained movement. If the chosen setting includes a
> storm, put thin vertical lightning behind the scenery and a broad cloud bank
> above the focal building, with a separate soft flash above the shading.
> Use scoped styles and unique SVG IDs, keep content readable/clickable, and
> deliberately compose mobile views. Reuse effects/reduced-motion preferences
> without duplicating the atmosphere controller or changing audio behavior.
> Seek approval for new artwork and composition before polishing motion. Verify
> asset loading, alignment, Chromium/WebKit at four widths, controls and existing
> page behavior. Save locally; do not commit, push or deploy unless requested.

## 12. Matching interface artwork

The shared interface uses original local SVG ornamentation:
[gothic-frame.svg](assets/gothic-frame.svg) supplies engraved bronze corners,
and [gothic-rule.svg](assets/gothic-rule.svg) supplies heading dividers.
These are original vector decorations, not sourced mansion imagery.

The frame is a non-interactive `::after` border image inside an isolated card.
Keep it behind the content with a negative stacking level. Reserve at least
the frame's inset plus border width in every card padding direction.
Desktop uses a 5-pixel inset and 28-pixel frame inside 36-pixel padding;
mobile uses a 4-pixel inset and 20-pixel frame inside 26-pixel padding.
The first oversized-corner version overlapped heading letters and was corrected.
Do not restore that overlap or use overflow clipping to hide it.

Metallic button gradients, dark secondary buttons, inset fields and page chrome
share the existing palette. Preserve semantic danger/selection states, disabled
states, minimum touch sizes, keyboard focus and reduced-motion behavior.
Long labels must wrap; QR codes must shrink to fit their padded cards.
