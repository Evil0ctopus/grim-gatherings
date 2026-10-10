# Design brief: Homepage supporting elements

## Intent and baseline

- Date: 2026-10-10.
- Owner's request: "now we need to do this for all the othr thingsin the
  animation from the gate and fence to the toob stones and trees and lighting
  and couds and fog and bats and moon and candles and grass and driveway ect."
- Target: homepage exterior only. Future interiors and game scenes remain
  separate projects.
- Baseline: the accepted wider weathered house and scene at `0643e5c`,
  published and verified in the preceding review. The worktree was clean
  when this supporting-element commission began.
- Composition: [saved layout/density baseline](composition-baseline.md).
- Status: commissioned; individual supporting designs not yet selected.
- Requested change: apply generate/review/refine/save to the remaining
  homepage elements, rather than treating the house as the only detailed asset.
- Protected: accepted house, seven-window shadow, path/entrance alignment,
  connected gate/fence geometry, one-time arrival, readable UI, effects-off,
  reduced motion, and immutable historical artwork.
- Release: review candidates on the test site only; no `.com` approval.

## Work sequence and review gates

### Owner-authorized test publication: 2026-10-10

The owner said the candidate "looks good enough", deferred further visual
tweaks, reported choppy motion, and requested: "build it and put it on the
test site and ill review it ther". This explicitly authorizes `main` test-site
publication, not `.com` promotion.

Local frames at 0, 5, 10, 15 and 20 seconds were inspected. Gate hinges were
moved into the masonry, the path brought up to the steps, the right tree moved
left for foreground overlap, and gate baseline/moon clearance corrected.
The local HTML now runs directly without module-file loading restrictions.
The runtime translates the candidate to SVG/image layers and CSS motion,
avoiding full-canvas filtered redraws on every frame. Color grading is baked
into size-bounded runtime derivatives by
[prepare-runtime-art.ps1](working/prepare-runtime-art.ps1), with source/output
hashes in [runtime preparation](working/runtime-art-preparation.json).
The protected house remains unchanged; its seven-window shadow is retained
through a nested SVG mapping the original approved window geometry.

Focused structural/build tests pass (12 tests). Sequential Chromium checks
pass at widths 320, 390, 768, 1408 and 1920: all bundled image sources decode,
the house fits, gates finish opening at 10 seconds before passage, gateway
fades at 20 seconds, effects-off/reduced motion stop motion, and returning
home does not replay arrival. Further owner visual tweaks remain deferred.
No backend or production branch changes are authorized.

### Owner corrections and local animated candidate: 2026-10-10, 14:31

The owner rejected revision 5: the right tree was too big, branches should be
in front rather than behind the house, gate/fence did not connect to pillars,
and the excessive scattered graves were cut off by the house, making it appear
to float. The owner requested animation after correction, with gates opening
as the camera passes through them. This supersedes the revision-5 composition
recommendation and its interpretation of foreground branches and marker density.

The [revised local animated candidate](previews/estate-animation-review.html)
and its [renderer](previews/estate-animation-review.js) use the existing
revision-5 prepared derivatives, not altered originals. The candidate:
- Reduces the right tree from 1050 to 650 scene units and draws trees after
  the house so branches are foreground elements.
- Replaces 28 scattered markers/monuments with ten explicitly placed varied
  markers/monuments outside the house footprint, adding contact shadows.
- Adds a broad house-base contact shadow and an aligned central path.
- Splits the gate source at its center into independently hinged leaves,
  overlapping outer hardware into pillar edges; fence-panel ends overlap
  masonry and adjoining panels rather than matching transparent image boxes.
- Opens gates from seconds 1-10 before camera passage from seconds 10-20.
  The test page was inspected read-only and confirmed its existing 9-second
  gate-open and 18-second camera/gateway animation timing. The local pass adds
  stronger foreground expansion to demonstrate moving through the gateway.
- Provides replay, pause/resume, effects-off, reduced motion, and hidden-tab
  suspension. Uses drifting clouds/fog/bats, candle flicker, scrolling rain,
  and one restrained lightning appearance per 17 seconds.

JavaScript syntax and whitespace checks pass. Browser rendering, visible
motion, entrance geometry, performance, reduced-motion behavior, and responsive
framing are NOT verified yet: after reviewing the test page, free physical
memory remained below the 4 GB safety threshold (3.56-3.97 GB readings).
An attempt to close the task-opened reference tab reported it no longer existed.
No additional browser or server was started, and no unrelated processes were
stopped. This is incomplete review work, not an accepted correction or finished
runtime animation. Both sites and runtime files remain unchanged.

### Local candidate gallery: 2026-10-10

The owner said "lets do it" to reviewing the saved supporting candidates.
The [local artwork review gallery](previews/supporting-artwork-review.html)
groups the originals by entrance, graveyard, trees, ground, sky, and light,
with known preparation limitations and earlier unsuccessful attempts labeled.
It is not a composited scene, and recommendations are not owner selections.
The gate-selection question received no owner answer, so candidate approval,
cutout preparation, integration, and publication remain pending. Originals
and the accepted house are unchanged.

### Owner-delegated candidate selection and composition: 2026-10-10

The owner subsequently said "i truct your judgment and you have an imge i sent
to structure the animation from using the images we generated", followed by
"we will do what you think". This supersedes the pending individual-selection
gate above: the assistant may choose among the generated candidates and
prepare a local composition using the saved layout/density reference. It does
not authorize a new house, publication, or production promotion.

Selected for local preparation: gate 3, the fence panel, Gemini pillar 2,
lantern 2, rounded headstone 1, the short broken marker, cross, angel monument,
both distinct large trees, the slender distant tree, soil and paving textures,
grass and edge weeds, moon, cloud bank, bat, lightning 3, rain, fog, candle, and
candle glow. Near-duplicate and cropped attempts stay in generation history.
The accepted house remains unchanged. Masking quality and the composed still
must be inspected before treating preparation as complete; motion, responsive
framing, and release approval remain separate.

Image processing and browser rendering paused when free physical memory fell
below 4 GB (3.54-3.78 GB observed). No composed scene or new cutouts have been
produced yet. The optional automation-browser page was closed; the owner's
shared VS Code Gemini page was not closed. Resume processing only after the
memory safety check passes.

### Local preparation and composed still: revision 5, 2026-10-10

Memory recovered above the pause threshold after closing the extra automation
page. The [Windows preparation recipe](working/prepare-supporting-preview.ps1)
processes images sequentially with System.Drawing, without installing packages
or launching another browser. It refuses to overwrite any revision and checks
memory before processing. Run it with a new `-Revision` value to preserve future
experiments independently.

The [current still candidate](previews/estate-composition-v5.png) is 1600 x 1000.
It uses the selected generated supporting artwork and the accepted runtime
house without modifying the house file. The [prepared derivatives and metadata](working/supporting-preview-v5/preparation.json)
record 23 original filenames, source/output SHA-256 hashes, keying modes, and
crop rectangles. The script verifies originals and the house remain unchanged.
Materials remain full-size; other images are cropped to visible alpha bounds
with four pixels of clearance where the original permits.

White-backed objects use a neutral-white key (channel spread at most 35,
fully opaque below 210, fully transparent at 235) with edge decontamination.
Black-backed effects derive alpha from the largest RGB channel, discarding
values at or below 6 and unpremultiplying color. This is a local preview
technique, not recovered original alpha or production-quality hand masking;
bright neutral details and thin JPEG edges still require close final review.
Texture tiling is a material-layout experiment, not verified seamless or
perspective-correct paving.

Composition review:
- The house is prominent at 630 x 436, about 39% of canvas width; its proportions,
  seven windows, roofline, and entrance are intact. No recoloring is applied to
  the house. Tree branches sit behind it instead of covering its facade.
- Substantial distinct trees frame both sides; foreground cropping is
  intentional, matching the reference's framing role.
- Twenty-six near/far markers plus an angel and larger cross provide varied
  forms and scale. Eight slender trees supply distance; no duplicate generation
  is counted as a new design.
- The path meets the central stairs; ten candles line its edges. Closed gate 3,
  pillars, repeated fence panels, and unlit lantern fixtures form the entrance.
  Final gate-leaf separation, hinge motion, fixture mounting, and ground contact
  remain runtime-preparation tasks.
- Moon upper-left, layered clouds, six bats, two bolts, subdued rain, and fog
  populate the sky and ground. Fog adds separation without replacing terrain.
  The hard terrain transition found in revision 4 was softened in revision 5.
- This is an artwork-only still, not a screenshot of the existing arrival or
  settled animation. It does not yet validate UI readability, mobile framing,
  reduced motion, effects-off, or animated shadow/weather behavior.

Revision 1 failed visual inspection because DPI-dependent rasterization left
opaque blocks. Revision 2 is incomplete: a corner-alpha guard incorrectly
rejected rain streaks reaching an image corner. Revision 3 fixed pixel-size
rasterization and masking but had branches over the facade and entrance gaps.
Revision 4 improved facade clearance, white keying, and fence connections.
These earlier outputs remain labeled processing history, not approved artwork.
Revision 5 is the current still recommendation in the review gallery.

Validation passed for all 23 derivative dimensions and SHA-256 hashes,
original-source and accepted-house hashes, transparent corners of white-key
cutouts, sampled visible/transparent alpha ranges, preview checksum, gallery
links, and `git diff --check`. The still itself and the gate/tree masks were
visually inspected. Final free memory was 4.95 GB physical and 20.95 GB virtual.

No runtime files, accepted originals, deployment branches, backend resources,
or live sites were changed. Final still acceptance and subsequent motion/release
approval remain separate from the owner's delegated selection authority.

Start with the gate/fence design, then matching supporting objects. The
sequence below is an implementation proposal, not approval of any candidate.
Keep objects separable where motion requires it; a single flattened landscape
cannot supply independently opening gates or flying bats.

| Group | Elements to develop | Status |
|---|---|---|
| Entrance | Gate leaves, attached fence panels, stone pillars, lantern fixtures | Gate, fence-panel, stone-pillar, and lantern proposals generated; all await review |
| Graveyard | Varied headstones, crosses, larger monuments, foreground/distant variants | Rounded, small broken-top, cross, and angel-monument proposals generated; review/preparation and more variants pending |
| Trees | Large bare framing trees and smaller distant trees | Broad and asymmetrical large-tree proposals plus a visibly slender distant-tree proposal generated; all remain unapproved |
| Ground | Grass/soil, stone driveway, edge vegetation | Ground-soil, driveway-paving, grass-clump, and broad-leaf edge-weeds proposals generated; all await review |
| Sky | Moon, clouds, bats, lightning, rain | Full-moon, storm-cloud, bat, fully framed lightning, and rain-overlay proposals generated; all await review |
| Atmosphere/light | Ground fog, candle artwork, glow/lighting layers | Candle, candle-glow, and ground-fog proposals generated; other lighting layers pending |

Generated stills provide artwork, not motion. Cloud/fog transparency, rain
movement, lightning flashes, candle flicker, bat flight and gate hinges need
appropriate local preparation and animation; review their still appearance and
motion separately. Do not assume a generator can deliver seamless textures,
true alpha, rigged movement, or consistent frames without inspection.

## Observable acceptance criteria

- Cohesive detailed gothic illustration; weathered green-gray stone,
  aged dark iron, cool exterior light and amber candle accents.
- Complete silhouettes with preparation margins; no stretched, duplicated,
  or visibly seamed architecture.
- Gate leaves can open independently; fences meet their supports without
  gaps, and the central opening remains aligned with the entrance.
- Grave markers must visibly vary in shape and scale: include smaller and
  larger stones, crosses, and distinct monuments rather than repeating one
  headstone design.
- Rich layered graveyard, substantial edge trees, low fog, populated sky,
  and legible house/UI consistent with the composition baseline.
- Inspect desktop/mobile arrival and settled framing, including 320/390px
  mobile widths; retain motion accessibility and check asset size/performance.
- Show each candidate for owner acceptance before replacing its live element.

## Sources and preparation

Generate original-art text prompts through the owner's shared browser. Copilot
reached its daily generation limit; the owner switched the workflow to Gemini.
Do not upload project code, private references or credentials. Retain supported
full-resolution downloads, prompt revisions, provider/conversation links,
terms checks, checksums, preparation recipes and owner feedback in this library.
Three gate candidates, one fence-panel candidate and one stone-pillar candidate
are now preserved as proposals; none has been accepted or integrated.

## Decision history

| Date | Owner feedback | Scope | Remaining choice |
|---|---|---|---|
| 2026-10-10 | Apply the successful process to all remaining homepage elements | Supporting-element redesign commissioned; house stays accepted | First gate design |
| 2026-10-10 | Tombstones must vary in size and form, including crosses | Require visible graveyard variety; do not repeat one marker design | Develop individually distinct marker silhouettes and scales |

## First gate candidate prompt and browser status

The owner was unavailable to answer the initial gate-style question. Prepare
an ornate weathered gothic candidate as a proposal, not a confirmed selection.
Generate the gate first, then matching fence, pillars and fixtures separately
so the gate leaves remain usable for opening animation.

```text
Generate an original image, not instructions. Create a detailed gothic
storybook illustration of ONE complete closed double-leaf wrought-iron
estate gate, viewed straight on. Weathered dark green-black iron, pointed
spear finials, graceful restrained gothic scrollwork, continuous outer frames,
convincing hinges on the two outer edges and a clear central seam where the
leaves meet. A gently arched top, tall substantial proportions, fine aged
surface detail and cool upper-left lighting. Match detailed weathered
green-gray gothic masonry and warm amber atmosphere, but show ONLY the
isolated iron gate: no house, pillars, lanterns, attached fences, ground,
scenery, people, lettering, logos or watermarks. Keep generous clear margins
around the entire gate, including hinges and bottom rails. Use a plain pure
white background for clean local cutout preparation. Landscape canvas.
The left and right leaves will later be separated locally to animate opening.
Do not render it already open, add a solid opaque wall behind the ironwork,
or crop any finials.
```

The shared Copilot conversation was reopened and the prompt entered.
The visible Send action timed out waiting for a stable control; a subsequent
click and keyboard attempt did not clear the composer or produce a new
response. No gate image has been generated, downloaded, or accepted.
The prompt is preserved above for resubmission; do not treat the prior house
response as a new gate result.
All runtime assets and deployed sites remain unchanged during this step.

At the subsequent retry, free physical memory was 3.92 GB. Unloading the
task-opened Copilot page to `about:blank` did not restore sufficient headroom
(3.83 GB physical, 19.79 GB virtual). Image generation is paused below the
project's 4 GB physical-memory threshold. No unrelated process was stopped.
The owner was unavailable to respond to the memory-recovery question.
Resume from the saved gate prompt once memory permits; verify actual
submission and a new image before recording generation as successful.

### Browser reopened; provider usage limit confirmed

Memory later recovered to 4.11 GB physical / 20.16 GB virtual. The old page
handle was no longer available, so Copilot was reopened in the shared browser.
The gate request was successfully submitted in a new
[gate conversation](https://copilot.com/chat/conversation/71c6844d-e2a4-4774-bccd-f60799116e43).
The provider responded: "You've reached your daily limit. Get more usage now
or check back at 7:00 PM." The composer is disabled and an Upgrade option is
shown. No gate image was returned.

The actual submitted prompt requested a complete closed double-leaf gate,
straight-on, weathered dark green-black iron, pointed finials, restrained
scrollwork, outer hinges, center seam, gently arched top and upper-left light,
on pure white including the spaces between bars. It excludes house, pillars,
lanterns, fences and scenery, with margins and separable leaves for animation.
This preserves the first-candidate intent above.

Do not bypass the service limit, change accounts, purchase an upgrade or
switch image providers without owner authorization. Keep this conversation
open for the owner's review and resume after the provider's displayed reset
or an owner-selected legitimate service option. Existing artwork and sites
remain unchanged; the supporting commission is not complete.

## Ready-to-use supporting-element prompts

These are unsent draft prompts, not generated or approved assets. Submit one
at a time and refine from the actual result and owner feedback. After the
gate is accepted, describe its selected details explicitly in matching fence
and fixture prompts; do not assume a separate chat remembers its appearance.

### Shared style text

Prepend this to each object prompt:

```text
Generate an original image, not instructions. Detailed gothic storybook
illustration with convincing aged surfaces and fine readable detail, not
a flat icon. Cool upper-left exterior illumination, subdued green-gray stone,
dark weathered iron and natural muted vegetation, with amber light only where
requested. Match a broad three-gabled weathered stone mansion. No text,
logos, watermarks, people or unrelated scenery. Show the complete requested
object with generous preparation margins.
```

For solid objects, request pure white isolation including gaps. For diffuse
effects, request true transparency if supported, otherwise black isolation
and record that it needs a different local compositing recipe. Black-backed
effects must not be processed using the house's white flood-mask script.

| Candidate | Append to shared style text | Preparation and review requirement |
|---|---|---|
| Fence panel | One straight-on wrought-iron fence panel with pointed finials, complete top/bottom rails and end supports, restrained gothic scrollwork and visible wear. Pure white behind and between bars. No gate, pillars or landscape. | Match the accepted gate; inspect every gap and both rail ends. Join panels without stretching ornament. |
| Stone pillar | One tall square gate pillar in aged green-gray cut stone, chipped edges, restrained carved gothic cap and moss in joints. Nearly straight-on with slight visible side depth. Pure white isolation. No attached ironwork or lantern. | Match house masonry; align fence and gate attachments locally. Keep lantern separate. |
| Rounded headstone | One aged rounded-top cemetery headstone with a substantial base, chipped green-gray stone, faint abstract weathering and sparse moss. No legible inscription. Slight natural perspective, pure white isolation. | First grave variant; retain grounding/base and avoid repeated identical placement. |
| Cross monument | One weathered stone cemetery cross on a stepped plinth, modest carved detail and readable complete silhouette. No inscription, vegetation or other graves. Pure white isolation. | Separate candidate; compare scale with headstones rather than merely recoloring them. |
| Angel monument | One solemn aged stone angel cemetery statue on a substantial plinth, folded wings and downward gaze, coherent carved anatomy and fine erosion. No inscription or surrounding graves. Pure white isolation. | Review anatomy and large-monument hierarchy against the composition baseline before accepting. |
| Foreground tree | One large old leafless tree, thick gnarled trunk, rooted base, branching limbs reaching inward and overhead, finely tapered twigs, dark weathered bark and subtle cool highlights. Entire crown/root silhouette on pure white. No ground or scenery. | Preserve fine branches during masking; choose a distinct second tree instead of relying only on mirroring. |
| Distant tree | One smaller slender leafless tree with an irregular airy crown, visible trunk/root base and subdued detail. Complete silhouette on pure white. No scenery. | Distinct form suited to distance; atmosphere/scale applied locally. |
| Grass clump | One irregular low clump of sparse dark desaturated grass and small weeds with individual blades and a narrow rooted base. Pure white isolation. No large soil rectangle or flowers. | Retain fine blades; use restrained varied patches rather than a repeated decorative border. |
| Ground material | A top-down patch of damp dark soil, sparse grass, small stones and subtle worn texture, evenly lit with no horizon, objects, border, baked shadow or spotlight. Fill the landscape canvas. | This is a material, not a cutout. Inspect tiled joins before reuse; seamlessness is not assumed. |
| Driveway material | A top-down patch of aged irregular rectangular paving stones, dark damp green-gray surfaces, worn joints and subtle moss. Even illumination, no horizon, buildings, border or perspective. Fill the canvas. | Locally project onto the existing aligned driveway; test texture seams and avoid changing the entrance anchor. |
| Lantern fixture | One complete gothic outdoor iron lantern fixture with modest scroll bracket, aged dark iron, clear glass and an unlit interior. Straight-on with slight side depth, pure white isolation. No candle or stone pillar. | Keep flame/candle and glow separate; verify bracket orientation and attachment. |
| Candle | One short aged ivory candle with a small wick, wax drips and a modest natural amber flame. Complete isolated silhouette on pure black, no holder, surrounding halo, smoke or scenery. | Inspect transparency/color edges and flame flicker separately; do not assume a still is an animation. |
| Moon | One detailed full moon with subtle crater variation, cool pale blue-gray light and a clean circular silhouette on pure black. No halo, clouds, stars or landscape. | Preserve circular proportions; create controlled halo locally and review against sky brightness. |
| Clouds | One broad irregular bank of dark blue-gray storm clouds with softly feathered outer edges and natural layered volume. True transparent background if supported, otherwise pure black. No moon, sky gradient, lightning or landscape. | Inspect actual alpha; cloud drift must not expose rectangular edges or obscure the entire roof. |
| Fog | One wide thin low-lying band of cool neutral ground mist with irregular wisps, soft fading edges and open transparent gaps. True transparent background if supported, otherwise pure black. No terrain or objects. | Use low-opacity separate layers; reject opaque slabs and conspicuous repeated patterns. |
| Bat | One anatomically coherent small flying bat, front-three-quarter view, open wings, readable membranous structure and dark cool body. Complete silhouette on pure white. No moon, sky or swarm. | Review anatomy and flight scale; wing motion needs separately reviewed local articulation or additional poses. |
| Lightning | One irregular natural branching lightning bolt with a narrow pale core, restrained cool glow and fine uneven forks, vertical composition on pure black. No clouds, landscape or sky. | Separate glow/core where feasible; flashes retain existing effects-off and reduced-motion safeguards. |

Lighting is also a compositing task, not a requirement for a flattened
generated overlay covering the whole scene. Preserve warm window/candle
contrast and cool exterior light; tune halos, shadows and flashes after
accepted elements are placed. Rain and any additional elements should receive
the same individual brief/review rather than being silently added.

For every accepted candidate, record the submitted prompt verbatim, provider
response, supported original download, dimensions/hash, AI/provenance terms,
local mask/crop recipe, approval and responsive motion evidence. All entries
above remain pending generation/review except the gate, which is generated
and awaiting the owner's candidate decision below.

### Gate candidate generated: awaiting owner review

- Generated with Microsoft Copilot on 2026-10-10 using the prompt above in
  [this conversation](https://copilot.cloud.microsoft/chat/conversation/2713751d-e44d-43e1-9fab-bde045668190).
- Copilot returned an image with its supported Download control. The unchanged
  downloaded original is
  [copilot-gothic-estate-gate-candidate-2026-10-10.png](originals/copilot-gothic-estate-gate-candidate-2026-10-10.png):
  1536 x 1024 RGB PNG, 2,045,123 bytes, SHA-256
  `870F7BA76B5DD2349086CDB6B161B67696FDC5FB6E581135C098D4B8E1E98328`.
- AI-generated, not CC0 and not represented as having exclusive rights or
  blanket copyright clearance. No project art, code, private references or
  credentials were uploaded. The existing
  [Microsoft terms record](../../references.md#accepted-microsoft-copilot-generation-2026-10-10)
  applies as a limitation, not a rights guarantee; preserve provider metadata
  and do not redistribute this original as stock artwork.
- Visual review: detailed, weathered dark green-black iron; closed, symmetric
  double leaves; readable center seam and outer hinge hardware; pointed finials
  and restrained gothic scrollwork. The white isolation background is opaque
  (RGB, no alpha), so it requires local preparation. The topmost finial has
  very little canvas margin, short of the generous-margin requirement; the
  lower and side clearances are larger. No background removal, cropping,
  separation, animation, runtime integration, or publication has been done.
- Status: proposal only, awaiting owner choice to refine its framing, accept
  this image for local preparation, or reject and generate a new gate.

### Gate framing refinements and download preservation

Because the first candidate's apex finial had little top clearance, two
text-only refinements were generated in the same Copilot conversation; neither
used an uploaded reference:

1. [Candidate 2](originals/copilot-gothic-estate-gate-candidate-2-2026-10-10.png):
   1536 x 1024 RGB PNG, 1,918,555 bytes, SHA-256
   `CD7C24F4C1835A324255A91422AEA9F1AF6C7221D90EFD96B68CE8F470329900`.
   It has more top clearance than candidate 1 but appears not to meet the
   prompt's 12% top-margin target. It is not accepted or integrated.
2. [Candidate 3](originals/copilot-gothic-estate-gate-candidate-3-2026-10-10.png):
   1536 x 1024 RGB PNG, 1,597,749 bytes, SHA-256
   `737574C328A386BBF3779719B4870D7AE8FA0EB390B2AC7655B1D1E1318C6CA6`.
   Its submitted prompt, verbatim:

   ```text
   Generate a new original image from text only; do not upload or reuse any existing image. Show ONE complete, closed, symmetrical double-leaf wrought-iron estate gate in a detailed gothic storybook illustration. Aged dark green-black iron with restrained green-gray patina, elegant pointed spear finials, fine but readable gothic scrollwork, gently arched top, continuous outer frames and rails, visible hinge hardware at both far outer edges, and a clear central seam. Straight-on view, soft cool upper-left light, isolated on pure solid white. LANDSCAPE 3:2 canvas. COMPOSITION IS CRITICAL: leave a broad, unmistakable blank white band above the central finial equal to at least one-fifth (20%) of canvas height. Leave 10% blank below the bottom rail and 8% blank at both sides beyond all hinge hardware. Fit the entire gate within the central 70% of canvas height; the top finial must not enter the upper 20% of the canvas. Keep every point of ironwork well away from every canvas edge. Preserve readable ironwork despite the smaller gate scale. No house, pillars, fence extensions, lanterns, ground, scenery, people, lettering, logos, watermark, cast shadow, or gradient.
   ```

   Full-resolution inspection confirms generous top, bottom, and side
   clearance, readable ironwork and a clear center seam. Like the first two
   candidates, it is RGB on opaque white and requires separately reviewed
   local preparation. This is the strongest current proposal, not yet
   owner-approved or integrated.

Copilot's supported Download action names each file `Designer.png`; successive
downloads reused that name in Downloads. The owner reported that this
overwrote the earlier house `Designer.png` and then the first gate download.
This collision should have been prevented. The exact house source remains
preserved as
[copilot-weathered-house-original.png](originals/copilot-weathered-house-original.png)
(2,677,656 bytes; SHA-256
`25076CE4545C357097543A46DB344C39E4FA4C45A4A3FC8DA02C7AC8CDC8FDAE`).
Gate candidates 1 and 2 were copied to the uniquely named library files above
before the next download. The current Downloads `Designer.png` is candidate 2.
Before another Copilot download, first move/copy the current download to a new,
unique filename and verify the saved hash; never reuse or overwrite a prior
original. Candidate 3 has since been downloaded and copied to the unique
archive filename above. The current Downloads `Designer.png` is candidate 3.
No gate has been integrated or published.

### Fence-panel candidate generated

- Generated in the same Copilot conversation from text only, using
  [candidate 3](originals/copilot-gothic-estate-gate-candidate-3-2026-10-10.png)
  only as a verbal style reference; no image was uploaded.
- Exact prompt:

  ```text
  Generate an original isolated image of ONE straight-on wrought-iron estate fence panel, intended to attach to the side of a matching gothic double-leaf gate. Match this style description: aged dark green-black iron with subtle green-gray patina, detailed gothic storybook metalwork, elegant pointed spear finials, restrained fine scrollwork and cool upper-left lighting. The panel must be a separate straight horizontal section, with complete continuous top and bottom rails and clear vertical end posts at both ends for joining; no gate leaves, no stone pillars, no lanterns. Keep pickets evenly spaced and structurally connected, scrollwork readable but less ornate than the focal gate, aged surface detail subtle. Pure solid white background, including every opening between bars; no shadows, landscape, ground, house, people, lettering, logos or watermark. Landscape canvas approximately 3:2, fit the complete panel including finials and end posts with at least 12% blank margin on every edge. Entire panel visible, no cropped rails or spikes.
  ```

- Preserved [full-resolution original](originals/copilot-gothic-fence-panel-candidate-2026-10-10.png):
  1536 x 1024 RGB PNG, 1,507,842 bytes, SHA-256
  `97D93A26F6BB135811B59CD88450D8CAF1BC3B46000B8FFE5DD1C340EACC9461`.
- Visual review: detailed weathered iron with repeating gothic trefoil and
  fleur-de-lis ornament, connected rails/pickets and complete square end posts.
  All components fit; side clearance beyond posts is visibly narrower than
  requested, while top/bottom clearance is ample. Opaque white background
  requires local preparation. The post widths and visible ornament need
  compositing against candidate gate proportions before deciding whether to
  use, refine, or regenerate. Proposal only; not integrated or published.

## Stone gate-pillar candidate generated: awaiting owner review

- Generated in the same Microsoft Copilot conversation from text only. The
  existing house and gate were used only as verbal style references; no images,
  project code, private references, or credentials were uploaded.
- Exact prompt:

  ```text
  Generate an original isolated image of ONE complete tall square stone gate pillar for the same detailed gothic storybook homepage scene as the text-described iron gate and fence proposals. Aged green-gray cut stone, broad stable plinth, subtly chipped corners, restrained carved gothic cap, fine readable weathering and light moss in joints, softly lit from upper left with cool night light. Nearly straight-on view with a slight visible right side for depth; upright vertical composition. Pure solid white background, no shadow, no attached ironwork, no lantern, no house, no ground, no scenery, no people, no lettering, logos or watermark. Show the complete pillar from plinth base to cap with generous white space on all sides, at least 10% of canvas height above and below; no cropping. Detailed realistic illustrated finish, consistent with the approved weathered house style, not a flat icon.
  ```

- Copilot returned an image and the response “Generated.” Its supported Download
  control was used. The preserved original is
  [copilot-gothic-stone-gate-pillar-candidate-2026-10-10.png](originals/copilot-gothic-stone-gate-pillar-candidate-2026-10-10.png):
  1024 x 1536 RGB PNG, 1,136,661 bytes, SHA-256
  `18B5BB4A695F44DA545F1A102AC22E36A040F67C891CF6E00E5F6F8EA396D463`.
- AI-generated, not CC0 and not represented as having exclusive rights or
  blanket copyright clearance. The existing
  [Microsoft terms record](../../references.md#accepted-microsoft-copilot-generation-2026-10-10)
  applies as a limitation, not a rights guarantee. No background removal,
  cropping, runtime integration, or publication has been done.
- Visual review: the complete pillar has a broad plinth, carved gothic cap,
  aged green-gray surface and slight visible side depth. The solid white
  background is opaque (RGB, no alpha). The cap and base leave only a few
  percent of canvas height, substantially short of the requested 10% vertical
  margins. Hold as a proposal; its composition and attachment fit are not
  approved.

### Pillar framing refinement blocked by image-generation limit

To correct the short vertical margins, this text-only refinement was submitted
after archiving the first image:

```text
Generate a NEW original image from text only: ONE complete tall square stone gate pillar for a detailed gothic storybook estate. Aged green-gray cut stone with subtly chipped corners, fine weathering and restrained moss in joints; broad stable plinth; understated carved gothic cap; slight visible right side for depth; cool upper-left night lighting. Pure solid white background, no cast shadow, ironwork, lantern, house, ground, scenery, people, lettering, logos or watermark. FRAMING: place the entire pillar centered and upright, occupying no more than 72% of canvas height. Leave a clearly visible blank white margin of at least 14% of canvas height above the cap and below the plinth, plus at least 12% on each side. Keep all corners and finials far from the edges. Vertical 2:3 canvas. Preserve a realistic illustrated stone finish; not metal, not a flat icon.
```

Copilot responded: “I can’t generate any more images today. Try again later, or
ask me to find similar images on the web instead.” No refinement image was
produced or downloaded. Do not retry image generation until the service limit
resets. The first pillar remains a preserved, unapproved proposal; no site
assets changed and neither site was published.

## Gemini stone-pillar candidates: generated 2026-10-10

After Copilot reached its daily image-generation limit, the owner signed in to
Google Gemini in the shared browser and explicitly asked to continue there. No
project files, artwork, credentials, or private reference images were uploaded.
The prompts used text-only descriptions. Conversation:
[Gothic Stone Pillar](https://gemini.google.com/app/fdf2376bf51eb1f1).

### Candidate 1: initial framing refinement

Exact prompt:

```text
Create an original image: ONE complete tall square stone gate pillar for a detailed gothic storybook estate. Aged green-gray cut stone with subtly chipped corners, fine weathering and restrained moss in joints; broad stable plinth; understated carved gothic cap; slight visible right side for depth; cool upper-left night lighting. Pure solid white background. No cast shadow, ironwork, lantern, house, ground, scenery, people, lettering, logos or watermark. FRAMING IS CRITICAL: center the full upright pillar so it occupies no more than 72% of the canvas height. Leave a clearly visible blank white margin of at least 14% of the canvas height above the cap and below the plinth, and at least 12% on each side. Keep every corner and finial far from the edges. Vertical 2:3 canvas. Preserve a realistic illustrated stone finish, not metal, not a flat icon. Return a generated image, not a textual description.
```

Gemini generated an image and its supported “Download full-sized image” control
saved the original as
[candidate 1](originals/gemini-gothic-stone-gate-pillar-candidate-2026-10-10.jpg):
848 x 1264 JPEG, 385,341 bytes, SHA-256
`ED6A17C82657184E128217736D322C0F6A444142582D56B0A5480F063AECD6F4`.
Visual review: complete illustrated stone pillar with carved cap and broad
stepped plinth, but it occupies most of the image height; top and bottom
clearance are only about 5-6%, below the requested margins. The background is
opaque white, not transparency. Proposal only.

### Candidate 2: zoomed-out framing

Exact prompt:

```text
Create a second, more zoomed-out original image of ONE complete upright gothic stone estate gate pillar. Do not make a close-up. Aged green-gray cut stone, broad stepped plinth, tall square shaft, restrained carved gothic cap with one centered finial, subtle moss/weathering, slightly visible right side, cool upper-left light; detailed storybook illustration. Isolated on pure solid white. No ironwork, lantern, buildings, ground, scenery, text, logos, watermark or cast shadow. COMPOSITION MUST BE WIDE: show the whole pillar centered at a small scale, occupying only the middle 50% of the canvas height. Leave the top 25% and bottom 25% of canvas completely blank white; also leave at least 18% blank white on left and right. Vertical 2:3 canvas. Every part of pillar fully visible, no cropping. Return the image, not instructions.
```

Gemini generated a second image. The full-sized download was confirmed by
Gemini; its completed download file was an image despite a temporary `.tmp`
filename. The duplicate retry produced byte-identical data and was discarded
after verification. The preserved original is
[candidate 2](originals/gemini-gothic-stone-gate-pillar-candidate-2-2026-10-10.jpg):
848 x 1264 JPEG, 247,446 bytes, SHA-256
`E50FDBF9F6F0D43EE98316A52B16721C8EE884C53F4299B494DDDB74735635CF`.
Visual review: the complete pillar is smaller and centered, with approximately
22% blank space above and below, and wider side margins. It is close to but
does not exactly meet the literal 25% top/bottom-margin target; the result is
more usable for later layout scaling than candidate 1. The background is
opaque white. Proposal only; no alpha preparation, runtime integration,
publication, or owner acceptance has occurred.

Both images are AI-generated; Google usage terms and commercial-use
implications have not yet been independently reviewed. Do not describe either
as CC0 or cleared for redistribution. Preserve the originals and verify
applicable terms before any integration or distribution.

## Gemini rounded-headstone candidates: generated 2026-10-10

Generated as text-only proposals in the same
[Gemini conversation](https://gemini.google.com/app/fdf2376bf51eb1f1).
No images or project materials were uploaded.

### Candidate 1

Exact prompt:

```text
Create an original image of ONE complete aged rounded-top cemetery headstone with a substantial stepped base. Match the detailed gothic storybook illustration style of a weathered green-gray estate: cut stone blocks, chipped edges, restrained moss in a few joints, subtle surface wear, cool upper-left night lighting. Slight natural three-quarter perspective, complete upright silhouette. The face must have only faint abstract weathering, NO letters, words, names, dates, symbols or readable inscription. Pure solid white isolated background, opaque white through all open areas; no cast shadow, grass, flowers, other graves, cross, angel, people, house, scenery, logo or watermark. Center the full stone and base, occupy no more than 68% of canvas height, leave at least 15% blank white above and below and 12% at both sides. Vertical 2:3 canvas. No cropping. Return a generated image, not a description.
```

The full-sized original was downloaded and preserved as
[candidate 1](originals/gemini-gothic-rounded-headstone-candidate-2026-10-10.jpg):
848 x 1264 JPEG, 505,046 bytes, SHA-256
`0F078C92B0A1155F6837674B2F763A81BF742D188D3893BAB0900BFDB023C47A`.
Visual review: a complete rounded-top weathered marker with a broad stepped
base and no legible inscription. It occupies about 82% of the canvas height,
short of the requested 68% maximum; the background is opaque white. Proposal
only.

### Candidate 2: zoomed-out framing attempt

Exact prompt:

```text
Make a new, zoomed-out alternative image of ONE complete rounded-top cemetery headstone with a broad stepped base. Keep the same aged green-gray cut stone, restrained moss, chipped edges and subtle surface weathering in a detailed gothic storybook illustration. No lettering, symbols, crosses or readable marks. Pure white isolated background; no shadow, grass, flowers, other graves, people or scenery. IMPORTANT: this is not a close-up. Center the entire stone at small scale, occupying only the middle 56% of the canvas height. Keep the top 22% and bottom 22% completely blank white; leave at least 18% blank at both sides. Vertical 2:3 canvas. The whole headstone including its full base must fit, not cropped. Return an image, not instructions.
```

The full-sized original was downloaded and preserved as
[candidate 2](originals/gemini-gothic-rounded-headstone-candidate-2-2026-10-10.jpg):
848 x 1264 JPEG, 513,650 bytes, SHA-256
`4526B2852DCE7508A0AEFC86A1E07AC3DDE1EDC86DCE0E567E39390B703F1492`.
Visual review: the result is nearly the same large rounded stone composition
as candidate 1 and does not follow the requested zoom-out framing. Keep the
original for provenance, but do not treat it as a meaningful variation or
approved option. Both headstone candidates remain proposals; develop clearly
different small/large markers, crosses and monuments as separate forms.

## Gemini stone-cross monument candidate: generated 2026-10-10

Generated as a separate text-only design in the same
[Gemini conversation](https://gemini.google.com/app/fdf2376bf51eb1f1). Exact
prompt:

```text
Create an original image of ONE distinctly different cemetery monument: a tall freestanding gothic stone CROSS on a wide two-tier square plinth. Make the cross silhouette unmistakable, with long upright shaft and shorter crossarms, subtly carved beveled edges and restrained worn gothic detail. Aged green-gray cut stone, chipped corners, a little moss in joints, cool upper-left night lighting, detailed storybook illustration consistent with the weathered estate. This is a cross monument, NOT a rounded headstone, NOT an obelisk, and NOT a statue. No lettering, names, dates, symbols or readable inscription. Pure solid white isolated background, no shadow, grass, flowers, other graves, people, house, scenery, logo or watermark. Show the entire cross and full plinth. Portrait 2:3 canvas with visible white breathing room above and below and on both sides; no cropping. Return a generated image, not a description.
```

The full-sized image was downloaded and preserved as
[the cross-monument candidate](originals/gemini-gothic-stone-cross-monument-candidate-2026-10-10.jpg):
848 x 1264 JPEG, 379,367 bytes, SHA-256
`A6DBD69129CFD29D4DC3948F4F365D207425760AB4A545A8A099317745A02EC5`.
Visual review: unmistakable tall cross silhouette, beveled stone edges and a
wide two-tier plinth; it is visibly distinct from the rounded headstone and
fits the green-gray stone description. The artwork leaves less breathing room
than requested and has an opaque white background. Proposal only; no alpha
preparation, integration, publication, or owner acceptance has occurred.

## Gemini small broken-top marker candidate: generated 2026-10-10

The owner clarified that grave markers must vary in size and form, including
smaller and larger stones and crosses; repeated copies of one headstone are not
acceptable. This separate short marker was generated as a text-only image in
the same [Gemini conversation](https://gemini.google.com/app/fdf2376bf51eb1f1).
Exact prompt:

```text
Create an original image of ONE small, low cemetery marker, deliberately much shorter and simpler than a tall cross monument. Use a squat upright stone slab with an uneven slightly broken peaked top and one chipped corner, set on a narrow low rectangular base. Aged green-gray stone, restrained moss and subtle wear, cool upper-left lighting, detailed but quiet gothic storybook illustration. It must NOT be rounded-top, NOT a cross, NOT an obelisk, and NOT a statue. No letters, symbols, names, dates or readable inscription. Pure solid white isolated background; no shadow, grass, flowers, other graves, people or scenery. Center the complete short marker and base, with substantial white space above and below, no cropping. Vertical 2:3 canvas. Return a generated image, not a text description.
```

The full-sized original was downloaded and preserved as
[the small-marker candidate](originals/gemini-gothic-small-broken-stone-marker-candidate-2026-10-10.jpg):
848 x 1264 JPEG, 281,734 bytes, SHA-256
`1014C2CD376C4FF39611804FEF80C43915D11C6487D2F7DD76CD401822DCF0C0`.
Visual review: distinctly squat and broken-peaked, with a wide low base; its
silhouette and scale differ clearly from the tall rounded marker and cross.
It has generous white margins and no readable marks. The background is opaque
white. Proposal only; no integration, publication, or owner acceptance.

## Gemini angel monument candidate: generated 2026-10-10

Generated as a separate text-only proposal in the same
[Gemini conversation](https://gemini.google.com/app/fdf2376bf51eb1f1). Exact
prompt:

```text
Create an original image of ONE solemn gothic cemetery angel statue on a substantial stepped stone plinth, a larger landmark monument clearly distinct from headstones and crosses. Full standing figure with anatomically coherent face and hands, long draped robe, large feathered wings folded downward at both sides, head bowed and gaze lowered, hands gently clasped in front. Carved from aged green-gray stone with fine chisel texture, chipped edges and sparse moss, cool upper-left night lighting; detailed realistic storybook illustration matching the weathered estate. Pure solid white isolated background. No grave marker, cross, cemetery, other statues, flowers, people, letters, inscription, logo or watermark; no cast shadow. Show the complete figure and full plinth, centered, with at least 12% blank space around the entire silhouette. Vertical 2:3 canvas, no cropping. Return a generated image, not a description.
```

The full-sized original was downloaded and preserved as
[the angel-monument candidate](originals/gemini-gothic-angel-monument-candidate-2026-10-10.jpg):
848 x 1264 JPEG, 487,462 bytes, SHA-256
`12084F1B370FE26DBC87D91D1DBA0F5A39503A3F174BDEEB451657925F7C7E05`.
Visual review: full standing angel with folded feathered wings, lowered gaze,
clasped hands, draped robe and substantial multi-tier plinth. The anatomy and
silhouette are coherent; the angel is unmistakably a larger distinct monument.
Its top/bottom margins are smaller than requested and the background is opaque
white. Proposal only; no integration, publication, or owner acceptance.

## Gemini candle candidate: generated 2026-10-10

Generated as an isolated text-only proposal in the same
[Gemini conversation](https://gemini.google.com/app/fdf2376bf51eb1f1).
Exact prompt:

```text
Create an original isolated image of ONE short, upright aged ivory cemetery candle for the gothic estate driveway. A simple slightly uneven wax pillar, visible natural drips down two sides, short dark wick and a small modest amber flame. Detailed but restrained weathered storybook illustration, cool moonlit highlights on the ivory wax with warm light only at the flame. Show the complete candle and flame with generous space around them. Pure solid black background; no holder, lantern, candle group, halo, cast shadow, smoke, ground, grass, grave, scenery, text, logo, or watermark. Keep the flame attached to the wick and separate in silhouette from the wax for possible local animation. Return a generated image, not a description.
```

The full-sized original was downloaded and preserved as
[the driveway-candle candidate](originals/gemini-gothic-driveway-candle-candidate-2026-10-10.jpg):
1376 x 768 JPEG, 307,508 bytes, SHA-256
`163517D1E835F0A16E565DF3F543AC36FD46FDD5A3050E1752EE3186702B58FE`.
Visual review: one centered, complete ivory candle with visible drips and an
attached amber flame; there is a soft glow around the flame despite the prompt
excluding a halo. The black JPEG background is opaque, so it is not a
transparent runtime cutout. Proposal only; no integration, publication, or
owner acceptance.

## Gemini ground-texture candidate: generated 2026-10-10

Generated as an isolated text-only proposal in the same
[Gemini conversation](https://gemini.google.com/app/fdf2376bf51eb1f1).
Exact prompt:

```text
Create an original seamless tileable top-down texture for the dark ground of a gothic cemetery at night. A close view of damp dark charcoal-green soil mixed with subtle patches of sparse short grass, tiny scattered stones and restrained natural variation. Detailed muted storybook surface texture, evenly lit with no directional shadows or bright highlights. The texture must repeat seamlessly on all four edges: match the left and right borders, and match the top and bottom borders, with no visible seam or central motif. Fill the entire square canvas edge to edge. Strictly top-down flat material only: no horizon, perspective, border, frame, large plants, flowers, graves, candles, path, buildings, sky, text, logo or watermark. Return an original image, not a description.
```

The full-sized original was downloaded and preserved as
[the ground-texture candidate](originals/gemini-gothic-ground-texture-candidate-2026-10-10.jpg):
1024 x 1024 JPEG, 864,146 bytes, SHA-256
`4DA261605FFF753AE87C32CC4DBB542CC65682F354D861F97CF67E7C4C659F08`.
Visual review: dark soil with scattered stones, leaf litter, grass and small
plants. It appears broadly patterned with visible repeated clusters, so
seamless edge matching has not been established; the texture may tile with
obvious repetition. It is only a material proposal, not an approved background
or integration. No owner acceptance.

## Gemini grass-clump candidate: generated 2026-10-10

Generated as an isolated text-only proposal in the same
[Gemini conversation](https://gemini.google.com/app/fdf2376bf51eb1f1).
Exact prompt:

```text
Create an original isolated image of ONE small irregular clump of sparse cemetery edge grass and weeds for a gothic night scene. Low rooted patch with individual thin dark desaturated green blades, a few tiny leaves, natural uneven height and an airy outline that can be cut out cleanly. Detailed muted storybook illustration with subtle cool moonlit highlights. Show the complete clump centered with generous white space around every blade on a pure solid white background. No soil mound, large ground rectangle, flowers, stones, candle, grave, other plants, landscape, scenery, text, logo, or watermark; no cast shadow. Return a generated image, not a description.
```

The full-sized original was downloaded and preserved as
[the grass-clump candidate](originals/gemini-gothic-grass-clump-candidate-2026-10-10.jpg):
1024 x 1024 JPEG, 367,171 bytes, SHA-256
`B51C0AF8A984CE0F81A4547DC283E16C6D6312634D65076635C8F1140B27D797`.
Visual review: a centered low clump with many individual blades, some tiny
leaves, and a visible rooted base; silhouette is complete with ample margins.
The JPEG background is opaque white and fine blades will need careful masking.
Proposal only; no integration, publication, or owner acceptance.

## Gemini edge-weeds candidate: generated 2026-10-10

The owner authorized continuing with the proposed distinct low edge-vegetation
patch by saying "ok lets get to it". This authorizes generation and review,
not acceptance or integration. Generated as a text-only proposal in the same
[Gemini conversation](https://gemini.google.com/app/fdf2376bf51eb1f1), using
the owner's existing shared VS Code browser. No private artwork or project
files were uploaded. Exact prompt:

```text
Create an original isolated image of ONE low, broad irregular patch of cemetery edge weeds for a gothic night estate. Make this distinctly different from a tuft of grass: small dark desaturated green broad leaves clustered in several uneven rosettes, a few creeping stems and curled dry seed stalks, with only a few grass blades. Low airy horizontal silhouette with varying heights, weathered muted storybook illustration and restrained cool green-gray moonlit highlights. Show every leaf and stem tip fully inside the frame with generous white clearance on all sides. Pure solid white background, no cast shadow. No flowers, soil mound, ground rectangle, stones, graves, candles, trees, buildings, scenery, text, logo or watermark. Landscape canvas. Return a generated image, not a description.
```

The full-sized original was downloaded and preserved without overwriting any
earlier original as
[the edge-weeds candidate](originals/gemini-gothic-edge-weeds-candidate-2026-10-10.jpg):
1376 x 768 JPEG, 473,487 bytes, SHA-256
`2C139BA9768F6708183F8BE52F0E56FD98B16BF7978600873B6503A0502C33BA`.
Visual review: a complete horizontal patch of overlapping green-gray broad
leaves, several rosettes, creeping stems, curled stalks, and a few grass blades.
It is visibly distinct from the grass-clump candidate. Top and bottom clearance
is substantial, but side clearance is narrow rather than generous. The leaf
mass is denser than the requested airy outline; scale and placement must not
hide the graves or path. Background is opaque white JPEG, not alpha; fine
stems, leaf gaps, and edge color need local masking and composition review.
AI-generated proposal only. Provider usage terms and redistribution rights
remain unverified; no owner acceptance, preparation, integration, or
publication has occurred.

## Gemini driveway-paving texture candidate: generated 2026-10-10

Generated as an isolated text-only proposal in the same
[Gemini conversation](https://gemini.google.com/app/fdf2376bf51eb1f1).
Exact prompt:

```text
Create an original top-down seamless tileable material texture of aged gothic driveway paving stones at night. Irregular rectangular dark green-gray stone slabs fitted together in a believable path surface, worn edges, fine cracks, damp muted surfaces and subtle moss only in some joints. Detailed weathered storybook illustration, consistent soft diffuse lighting, no strong directional shadows. Perfect repeating tile: all four edges must match exactly in pattern and tone, with no border or central focal stone. Fill the entire square canvas edge to edge. Strictly overhead material view, no perspective or horizon. No grass, candles, lanterns, graves, buildings, sky, text, logo or watermark. Return an original image, not a description.
```

The full-sized original was downloaded and preserved as
[the driveway-paving texture candidate](originals/gemini-gothic-driveway-paving-texture-candidate-2026-10-10.jpg):
1024 x 1024 JPEG, 785,100 bytes, SHA-256
`EF6BB7A59E8EC5720700AE43669C30FB3580CDC4C5E365492A3DAB34292CCF81`.
Visual review: aged irregular rectangular paving with coherent joints and
green-gray stone. The tile is grid-like and strongly repetitive; edge matching
and seamlessness have not been verified. Proposal only; driveway perspective
projection, seams, and entrance alignment must be reviewed locally before
integration. No owner acceptance.

## Gemini ground-fog candidate: generated 2026-10-10

Generated as an isolated text-only proposal in the same
[Gemini conversation](https://gemini.google.com/app/fdf2376bf51eb1f1).
Exact prompt:

```text
Create an original broad landscape image of ONE very low horizontal band of cemetery ground fog for a gothic night scene. Wispy, uneven cool blue-gray mist drifting close to the ground, with soft feathered translucent-looking edges, thin tendrils and several open gaps through which darkness can show. Keep the fog shallow in height, spanning across most of the wide canvas, fading gently to empty space above and below. Atmospheric detailed storybook painting. Use pure solid black background if transparency is unavailable. No land, horizon, grass, graves, trees, moon, clouds, buildings, light beams, text, logo or watermark. Avoid an opaque rectangular slab or dense cloud; keep mist delicate and low. Return an original image, not a description.
```

The full-sized original was downloaded and preserved as
[the ground-fog candidate](originals/gemini-gothic-ground-fog-candidate-2026-10-10.jpg):
1584 x 672 JPEG, 444,783 bytes, SHA-256
`83E2A31083B2E9603F60FE9D2CDDCD3EE6ED8AF0F7D90F1B7599FEF17CB8DBB3`.
Visual review: a broad, shallow band of cool mist with fine tendrils, feathered
edges and open black gaps. Its mist reaches both side edges and remains
vertically restrained. The JPEG background is opaque black; it is not yet a
transparent or animated fog layer. Proposal only; no integration, publication,
or owner acceptance.

## Gemini candle-glow candidate: generated 2026-10-10

Generated as an isolated text-only proposal in the same
[Gemini conversation](https://gemini.google.com/app/fdf2376bf51eb1f1).
Exact prompt:

```text
Create an original isolated image of ONE soft warm amber light glow for layering over a candle flame in a gothic night scene. A small bright warm center fading smoothly and naturally out to transparent-looking black, with no hard edge and no visible circular disc boundary. Pure solid black background for local masking. The subtle glow should occupy only a small central area with generous empty black around it. No candle, flame shape, lantern, rays, lens flare, smoke, objects, text, logo, or watermark. Soft understated storybook illumination, not a large spotlight; return a generated image, not a description.
```

The full-sized original was downloaded and preserved as
[the candle-glow candidate](originals/gemini-gothic-candle-glow-candidate-2026-10-10.jpg):
1408 x 768 JPEG, 353,777 bytes, SHA-256
`8A1F59D52B662C82F3D93B6C03455F45C921E79BC814A83A0E14F98FB207EF10`.
Visual review: a small central amber light fades softly into black, with no
hard circular boundary. The JPEG's black background is opaque; any mask or
composite must be reviewed against the real scene before use. Proposal only;
no integration, publication, or owner acceptance.

## Gemini full-moon candidate: generated 2026-10-10

Generated as an isolated text-only proposal in the same
[Gemini conversation](https://gemini.google.com/app/fdf2376bf51eb1f1).
Exact prompt:

```text
Create an original isolated image of ONE full moon for a gothic storm-night cemetery scene. A complete clean circular disk with subtle varied craters and delicate surface texture, pale cool blue-gray light, softly detailed storybook illustration. Keep the outer edge crisp and round, no crescent or phase. Center the whole moon with generous blank space on a pure solid black background. No halo, glow, stars, clouds, sky, lightning, buildings, landscape, text, logo, or watermark. Preserve a simple readable silhouette and realistic crater detail; return a generated image, not a description.
```

The full-sized original was downloaded and preserved as
[the full-moon candidate](originals/gemini-gothic-full-moon-candidate-2026-10-10.jpg):
1408 x 768 JPEG, 486,613 bytes, SHA-256
`5100A8D1B79AA9FAD583EBA82F266C8ACFE83CE0A58AB3B150261B405C13F943`.
Visual review: a complete circular, pale blue-gray moon with visible crater
texture and a crisp edge; the crop gives it generous black margins. Its face is
quite bright and high contrast. The black JPEG background is opaque and the
isolated moon has no scene halo. Proposal only; no integration, publication,
or owner acceptance.

## Gemini storm-cloud candidate: generated 2026-10-10

Generated as an isolated text-only proposal in the same
[Gemini conversation](https://gemini.google.com/app/fdf2376bf51eb1f1).
Exact prompt:

```text
Create an original isolated image of ONE broad horizontal bank of layered storm clouds for a gothic cemetery night sky. Irregular cloud masses with soft feathered wisps at the edges and natural volumetric layers, dark desaturated blue-gray with subtle cool highlights along a few upper edges. Detailed atmospheric storybook painting, not a flat icon. Let the cloud bank span most of a wide landscape canvas while leaving clear black space around its uneven silhouette. Use a pure solid black background if transparency is unavailable. No moon, stars, lightning, rain streaks, sky gradient, horizon, buildings, trees, landscape, text, logo, or watermark. No rectangular panel or border. Return a generated image, not a description.
```

The full-sized original was downloaded and preserved as
[the storm-cloud-bank candidate](originals/gemini-gothic-storm-cloud-bank-candidate-2026-10-10.jpg):
1376 x 768 JPEG, 486,423 bytes, SHA-256
`74E4FF4B55DBFC37DA10E82165B99A260A55DD7C43756ACA09AC3296A331F7E6`.
Visual review: one broad, irregular layered cloud bank with soft edges and
dark blue-gray volume, framed by black negative space. The JPEG background is
opaque black rather than alpha, so the boundary and masking recipe need to be
tested against the sky before any use. Proposal only; no integration,
publication, or owner acceptance.

## Gemini bat candidate: generated 2026-10-10

Generated as an isolated text-only proposal in the same
[Gemini conversation](https://gemini.google.com/app/fdf2376bf51eb1f1).
Exact prompt:

```text
Create an original isolated image of ONE flying bat, a clean near-black silhouette with the wings fully spread in a readable natural shape. Distinct pointed ears, small compact body, gently scalloped wing edges and fine finger-like wing structure, viewed in side profile as if gliding through a storm-night sky. Simple detailed storybook illustration, no eyeshine or glowing parts. Show the complete bat with generous clear space around every wing tip, centered on a pure solid white background. No second bat, moon, cloud, stars, lightning, branch, scenery, text, logo or watermark; no cast shadow. Return a generated image, not a description.
```

The full-sized original was downloaded and preserved as
[the flying-bat candidate](originals/gemini-gothic-flying-bat-candidate-2026-10-10.jpg):
1408 x 768 JPEG, 93,216 bytes, SHA-256
`D21CFC52F29CD9649A13D072CB0DDAEAF37AB4F45399C1DB9D7EBDA7F5ECE8F5`.
Visual review: a single centered bat with pointed ears, clearly articulated
wing fingers and broad spread wings; the pose is readable. The white JPEG
background is opaque, so background removal and motion-frame work remain
unreviewed. Proposal only; no integration, publication, or owner acceptance.

## Gemini lightning candidates: generated 2026-10-10

Generated as isolated text-only proposals in the same
[Gemini conversation](https://gemini.google.com/app/fdf2376bf51eb1f1).
The first attempt prompt was:

```text
Create an original isolated image of ONE dramatic branching lightning bolt for a gothic storm-night sky. A crisp, naturally jagged main bolt descending diagonally with a few fine forked branches, luminous cool white-blue core and restrained soft blue edge glow. High-contrast detailed storybook effect with the entire bolt visible and generous clear margins. Pure solid black background; no clouds, rain, moon, buildings, trees, landscape, horizon, multiple bolts, text, logo, or watermark. Keep branches connected to the main stroke and avoid a broad flash that fills the frame. Return a generated image, not a description.
```

The first full-sized original was preserved as
[lightning attempt 1](originals/gemini-gothic-lightning-bolt-candidate-2026-10-10.jpg):
1408 x 768 JPEG, 452,322 bytes, SHA-256
`F12023072D849E28D5B38658BFDD1E400C45BD3A39217E84E8154F775A1826DB`.
Visual review: the dramatic fork pattern is strong, but the main bolt is
oversized and cropped at the upper edge. It is a proposal with a framing
defect, not a usable complete bolt as-is.

A second attempt used this framing correction:

```text
Create an original isolated image of ONE smaller, centered branching lightning bolt for a gothic storm-night sky. The complete bolt must fit comfortably inside the canvas: leave at least 15% empty black margin on all four sides, and do not let any luminous stroke or branch touch or cross an image edge. A crisp jagged main bolt descends diagonally through the middle with several fine connected forks, a cool white-blue core, and only a restrained soft edge glow. High-contrast storybook effect. Pure solid black background. No clouds, rain, moon, buildings, trees, landscape, second bolt, text, logo, or watermark. Ensure the entire start, end, and every fork are fully visible and centered; return a generated image, not a description.
```

The full-sized second original was preserved as
[lightning attempt 2](originals/gemini-gothic-contained-lightning-bolt-candidate-2026-10-10.jpg):
1408 x 768 JPEG, 459,466 bytes, SHA-256
`F9C37C9429F390DB678E34F7A783AD84361A5379B2F903BD707997B0629B281E`.
Visual review: it repeats the same oversized bolt composition and still crops
the main stroke at the upper edge; the requested framing correction was not
followed. The black JPEG background is opaque. Keep this as generation history,
not an accepted complete bolt; no integration, publication, or owner acceptance.

A third attempt specified a narrower vertical bolt with a quarter-canvas
clearance at top and bottom. Exact prompt:

```text
Create an original isolated image of ONE narrow, vertical branching lightning bolt for a gothic storm-night sky. Make the bolt short enough to fit entirely in the middle half of the canvas: leave at least one quarter of the image completely black above its highest fork and below its lowest tip, and wide black margins on both sides. Keep every part of the bolt fully inside the frame. A jagged bright white-blue main stroke descends diagonally from upper middle to lower middle, with a few thin connected forks; restrained cool blue glow only. Pure solid black background. No clouds, rain, moon, buildings, trees, landscape, multiple bolts, text, logo, or watermark. The bolt must be fully visible with clear black space on every side; do not crop it. Return a generated image, not a description.
```

The full-sized third original was preserved as
[lightning candidate 3](originals/gemini-gothic-contained-lightning-bolt-candidate-3-2026-10-10.jpg):
1408 x 768 JPEG, 306,575 bytes, SHA-256
`1A1BEF554B98A89213D813496E5393DA53675BF67B960BACDE61B27529E270FA`.
Visual review: the complete branching bolt now fits within the canvas with
substantial black space around the top, bottom, and sides. It is narrower and
more contained than the first two variants, and the branch silhouette is
readable. The black JPEG background remains opaque and requires a reviewed
local compositing/masking method. Proposal only; no integration, publication,
or owner acceptance.

## Gemini rain-overlay candidate: generated 2026-10-10

Generated as an isolated text-only proposal in the same
[Gemini conversation](https://gemini.google.com/app/fdf2376bf51eb1f1).
Exact prompt:

```text
Create an original wide cinematic rain overlay for a gothic cemetery night scene. Show many fine, varied, nearly vertical rain streaks slanting slightly from upper left to lower right, with subtle cool blue-gray highlights and restrained brightness. Use sparse midground streaks and a few slightly brighter foreground streaks, leaving enough dark negative space for the mansion and cemetery to remain readable. Keep the rain evenly distributed across the full canvas, with no large drops, splashes, puddles, ground, horizon, clouds, lightning, moon, buildings, trees, graves, people, text, logo, or watermark. Pure solid black background suitable for testing a screen blend or black removal; do not add a vignette or gradient. Wide landscape composition; return a generated image, not a description.
```

The full-sized original was downloaded and preserved as
[the rain-overlay candidate](originals/gemini-gothic-rain-overlay-candidate-2026-10-10.jpg):
1584 x 672 JPEG, 614,206 bytes, SHA-256
`9082C635DDCB5FAAD1A237EAE0C40ABFEC093F59EA55AA99787861025699040D`.
Visual review: the image has fine, full-canvas diagonal blue-gray streaks on a
near-black field with no scenery or visible gradient. The streaks are dense
and rather uniformly sized and spaced, so their depth variation is weaker
than requested and they may compete with the composition if left at full
strength. The JPEG background is opaque, not alpha. Screen blending, masking,
motion, density, and visibility over the actual scene remain untested.
Proposal only; no integration, publication, or owner acceptance.

## Gemini large bare-tree candidate: generated 2026-10-10

Generated as an isolated text-only proposal in the same
[Gemini conversation](https://gemini.google.com/app/fdf2376bf51eb1f1).
Exact prompt:

```text
Create an original isolated image of ONE large old leafless cemetery tree for a gothic storybook night scene. Broad gnarled trunk with visible rooted base, heavy limbs sweeping outward and inward across the upper half, many finely tapered bare twigs, irregular natural asymmetry, dark weathered bark with subtle cool green-gray highlights. Strong readable silhouette and fine branch detail; no foliage, leaves, flowers, fruit, birds or hanging objects. Pure solid white background, no ground, grass, cemetery, moon, clouds, house, scenery, people, text, logo or watermark; no cast shadow. Show the complete tree from roots to every branch tip, landscape canvas, centered with at least 12% white clearance around the full crown and roots. Detailed illustrated finish matching a weathered gothic estate. Return a generated image, not a description.
```

The full-sized original was downloaded and preserved as
[the large bare-tree candidate](originals/gemini-gothic-large-bare-tree-candidate-2026-10-10.jpg):
1376 x 768 JPEG, 729,748 bytes, SHA-256
`7FD1B0D55C1104DA58002E9C44C46E88BCC8209D8BDAC3888663E0AE4E17DA9`.
Visual review: a large, broad, leafless tree with a heavy rooted trunk,
weathered dark green-gray bark, and finely branched silhouette. Its irregular
branching and visible roots are useful, but the crown is broad and nearly
symmetrical rather than strongly irregular. The silhouette nearly fills the
canvas and does not meet the requested 12% clearance; the JPEG background is
opaque white. Proposal only; no integration, publication, or owner acceptance.

### Second large framing-tree candidate: asymmetrical silhouette

A second large framing-tree design was generated in the same
[Gemini conversation](https://gemini.google.com/app/fdf2376bf51eb1f1) to create
a visibly different silhouette for the opposite edge of the estate.
Exact prompt:

```text
Create an original isolated image of ONE second large framing tree for the opposite edge of a gothic estate scene. Make its silhouette clearly different from a broad symmetrical oak: a tall crooked trunk leaning slightly outward, one heavy main limb sweeping inward across the top, a much shorter broken limb on the other side, sparse irregular branches, and a few fine twigs. Gnarled rooted base, dark weathered green-gray bark with restrained cool moonlit highlights, detailed gothic storybook illustration. Show the entire tree from roots to every twig tip, with generous blank space around the silhouette on pure solid white. No leaves, foliage, hanging objects, ground, grass, buildings, moon, clouds, cemetery, other trees, text, logo, or watermark; no cast shadow. Wide landscape canvas. Keep this tree visibly distinct from a balanced spreading tree and do not mirror another tree. Return a generated image, not a description.
```

The full-sized image was downloaded and preserved as
[the second framing-tree candidate](originals/gemini-gothic-second-framing-tree-candidate-2026-10-10.jpg):
1376 x 768 JPEG, 301,104 bytes, SHA-256
`450E85BAD76475FEE6DBE9EA7A13484AA78B1CEDB41B120EEAFE5054409BA4D4`.
Visual review: it has a dramatically different, one-sided arching crown and
crooked rooted trunk, so it is not a mirror or duplicate of the broad spreading
tree. The branches frame a large open center; the upper twigs and roots sit
close to the image edges, giving less vertical clearance than the prompt
requested. Its white JPEG background is opaque. Proposal only; no integration,
publication, or owner acceptance.

### Distant-tree attempt 1: duplicate silhouette

The prompt above was submitted again to seek a smaller distant-tree form. Gemini
returned a tree with nearly the same broad crown, trunk, and root silhouette as
the large bare-tree candidate, despite the request for a slender, distinct
form. The full-sized download is preserved as
[the first distant-tree attempt](originals/gemini-gothic-distant-bare-tree-candidate-2026-10-10.jpg):
1376 x 768 JPEG, 443,844 bytes, SHA-256
`667E97C62504C2C5AD14753EC420B30FABDDEF357DE1A3D3D1CBA6E566FB19DB`.
Visual review: the result is a near-duplicate rather than a meaningful distant
variant. It is retained as generation history and must not count as a distinct
tree design; no integration, publication, or owner acceptance.

### Distant-tree candidate: slender silhouette

After the first attempt duplicated the large tree, a stricter silhouette prompt
was submitted in the same
[Gemini conversation](https://gemini.google.com/app/fdf2376bf51eb1f1):

```text
Create an original isolated image of ONE distinctly slender distant cemetery tree, with a silhouette unmistakably different from a broad spreading foreground tree. Use a thin, slightly crooked vertical trunk that forks high into a narrow, sparse, irregular crown; keep the whole crown much taller than it is wide, with short fine branches mostly reaching upward and only a few small side twigs. No massive horizontal limbs, no umbrella canopy, no broad symmetrical crown, and no large exposed root flare. Muted dark green-gray bark with restrained fine detail and subtle cool night highlights, in the weathered gothic storybook illustration style. Show the complete tree from base to every twig tip, centered on a pure solid white background with generous blank margins and no cast shadow. No leaves, foliage, grass, ground, graves, other trees, buildings, moon, clouds, scenery, text, logo, or watermark. Landscape canvas; preserve its narrow vertical silhouette. Return a generated image, not a description.
```

The full-sized original was downloaded and preserved as
[the slender distant-tree candidate](originals/gemini-gothic-slender-distant-tree-candidate-2026-10-10.jpg):
1376 x 768 JPEG, 119,938 bytes, SHA-256
`92DE3571EA4E0935D008697FD7F378D2EBCB356E8AD3F8947D11FE9615E866FB`.
Visual review: a narrow upright trunk forks into a slim, airy crown and is
clearly distinct from the broad foreground tree. It has generous white margins,
though its sparse detail may read too thin at small sizes. Background is opaque
white. Proposal only; no integration, publication, or owner acceptance.

## Gemini lantern-fixture candidates: generated 2026-10-10

Generated as isolated text-only proposals in the same
[Gemini conversation](https://gemini.google.com/app/fdf2376bf51eb1f1).
No project files, artwork, credentials, or private reference images were
uploaded.

### Candidate 1: ornate bracket

Exact prompt:

```text
Create an original image of ONE complete standalone gothic estate lantern fixture, intended to mount on a weathered stone gate pillar. Detailed storybook illustration: aged dark green-black iron frame with restrained gothic scrollwork, a short elegant curved wall bracket attached at the top and extending to the right, clear glass panes, complete pointed hood and finial, subtle cool upper-left highlights. Lantern is UNLIT and empty; no candle, flame, glow or visible light source, so those can be prepared separately. Slight three-quarter view with clear readable silhouette. Isolate on pure solid white background. No pillar, wall, gate, fence, house, ground, scenery, people, text, logos or watermark. Show the entire bracket, fixture and finial with generous blank space of at least 16% around the whole object. Landscape 3:2 canvas. No cropping. Return a generated image, not a description.
```

The full-sized image was downloaded through Gemini's control and preserved as
[candidate 1](originals/gemini-gothic-lantern-fixture-candidate-2026-10-10.jpg):
1264 x 848 JPEG, 333,252 bytes, SHA-256
`1B19E437608E78B056E7A8C2A668DC02475B3958538F269395DBD1EB750BE06A`.
Visual review: a complete dark iron lantern with clear panes and pointed hood,
but its ornate bracket/backplate assembly is oversized and the artwork leaves
less than the requested 16% vertical margin. The fixture appears unlit. Opaque
white background; proposal only.

### Candidate 2: restrained bracket and wider framing

Exact prompt:

```text
Create a refined alternative: ONE compact standalone gothic outdoor lantern fixture, not a close-up. A single small square clear-glass lantern with a modest dark weathered iron frame, a simple pointed hood and small finial. Attach only a short, graceful curved iron bracket extending to the RIGHT into a small narrow wall-mount plate; keep the bracket and plate restrained, no extra hanging ornaments. Cool upper-left highlights, detailed storybook illustration matching dark green-black aged iron. The lantern is unlit and empty: no candle, flame or glow. Pure white isolated background; no wall, stone, gate, fence, house, scenery, people, text, logo or watermark. LANDSCAPE 3:2 composition: keep the entire fixture small and centered, occupying no more than 58% of canvas width and 62% of canvas height, with at least 19% clear white margin on all four edges. Entire finial, bracket, plate and lantern visible without cropping. Return a generated image, not text.
```

The full-sized image was downloaded and preserved as
[candidate 2](originals/gemini-gothic-lantern-fixture-candidate-2-2026-10-10.jpg):
1264 x 848 JPEG, 247,986 bytes, SHA-256
`902DC2FA66EECE12A5FD0958D2BB3E42CAE93A545EFF6F0938DCED93F509CEF5`.
Visual review: the bracket is more restrained and the complete fixture is
centered with broad side margins. Vertical clearance is about 14-15%, below
the requested 19%; the white panes/background are opaque JPEG, not alpha.
Proposal only; no background preparation, integration, publication, or owner
acceptance has occurred.

## Reconfirmed scope and current execution state: 2026-10-10, 12:51 CDT

The owner reconfirmed that the accepted house is finished and that the
remaining non-house image elements in the homepage animation should be made
through Copilot's generate/review/refine/save workflow. This includes the gate,
fence, driveway and path, candles and lanterns, grass/ground, trees, clouds,
lightning, bats, moon, fog, grave markers/monuments, and any other visual
elements needed to complete the existing scene. Rain, illumination, and other
motion/effects still need scene-specific artwork review where appropriate;
generated stills do not replace their animation logic. Keep the house locked,
work element by element from the gate prompt, and do not publish unreviewed
assets.

Copilot was opened for this continuation, but redirected to Microsoft account
sign-in. The owner must complete sign-in in the browser; no credentials were
entered or inspected. Do not proceed with generation until the owner has
authenticated and the Copilot conversation is available. No image was
generated or downloaded during this attempt; all supporting candidates remain
pending and both sites remain unchanged.

## Corrected account and current resume point

The owner confirmed they had used the wrong account and switched to their
WGU account, then authorized retrying. A narrow read-only check of the shared
Microsoft Copilot page confirmed an editable "Message Copilot" composer and
no visible earlier daily-limit message. This does not establish the corrected
account's image-generation entitlement or guarantee that generation will work.
No school documents, account details, or unrelated chats were inspected.

Before submitting on the corrected account, free physical memory measured
3.26 GB and subsequently 3.35 GB, below the project's 4 GB pause threshold.
Free virtual memory remained above 19 GB. No generation was submitted on the
corrected account, and no unrelated processes were terminated.

Resume with the first gate prompt after memory headroom is restored. Check
the actual provider response before claiming generation succeeds; retain the
original through supported download controls, inspect it, and obtain candidate
review before replacing runtime artwork. Do not repeatedly retry generation
or poll memory while the same blocker persists. The prompt pack is saved;
all supporting candidates remain ungenerated and neither site has changed.

## Restart handoff: 2026-10-10, 12:36 CDT

The owner requested saving progress before restarting VS Code.

- Approved wider house: commit `0643e5c03bd819f60b6624a68972a92280d8a1d3`,
  published and verified on the GitHub Pages test site. House original,
  cutout, preparation script and review screenshots are preserved.
- Production remains `2222137cc56fd5a4f9370058a7500308253bfc3d`; no approval
  to update `.com`.
- This brief contains the supporting-element commission, first gate prompt,
  and unsent prompts for all other supporting categories. No supporting
  candidate has been generated or accepted.
- The owner switched to the correct WGU Copilot account. Last shared page:
  `https://copilot.cloud.microsoft/chat`. Browser handles may change on restart;
  reuse the newly shared page. Let the owner handle authentication directly.
- Six obsolete local-model extensions were uninstalled and their absence
  verified: `alejandrog.ollama-copilot-bridge`,
  `dartyushin.ollama-participant`, `ex3ndr.llama-coder`,
  `namdang.ollama-copilot-vscode`, `ollama.ollama`,
  `warm3snow.vscode-ollama`. Other extension groups were not removed.
- Last available memory after uninstall: 2.98 GB physical / 18.99 GB virtual.
  Restart is intended to unload already-active extension processes; a memory
  improvement is not yet verified. No unrelated processes were terminated.
- Next action: check memory once after restart. If sufficient, submit the
  isolated double-leaf gate prompt on the corrected account, inspect the real
  provider response, save a supported full-resolution original and show the
  candidate for review. Continue supporting elements individually, retaining
  movable layers, house identity, accessibility and test-only release gates.
