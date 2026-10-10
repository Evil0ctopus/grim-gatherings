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

Start with the gate/fence design, then matching supporting objects. The
sequence below is an implementation proposal, not approval of any candidate.
Keep objects separable where motion requires it; a single flattened landscape
cannot supply independently opening gates or flying bats.

| Group | Elements to develop | Status |
|---|---|---|
| Entrance | Gate leaves, attached fence panels, stone pillars, lantern fixtures | Pending first design choice |
| Graveyard | Varied headstones, crosses, larger monuments, foreground/distant variants | Pending |
| Trees | Large bare framing trees and smaller distant trees | Pending |
| Ground | Grass/soil, stone driveway, edge vegetation | Pending |
| Sky | Moon, clouds, bats, lightning | Pending |
| Atmosphere/light | Ground fog, candle artwork, glow/lighting layers | Pending |

Generated stills provide artwork, not motion. Cloud/fog transparency,
lightning flashes, candle flicker, bat flight and gate hinges need appropriate
local preparation and animation; review their still appearance and motion
separately. Do not assume a generator can deliver seamless textures, true
alpha, rigged movement, or consistent frames without inspection.

## Observable acceptance criteria

- Cohesive detailed gothic illustration; weathered green-gray stone,
  aged dark iron, cool exterior light and amber candle accents.
- Complete silhouettes with preparation margins; no stretched, duplicated,
  or visibly seamed architecture.
- Gate leaves can open independently; fences meet their supports without
  gaps, and the central opening remains aligned with the entrance.
- Rich layered graveyard, substantial edge trees, low fog, populated sky,
  and legible house/UI consistent with the composition baseline.
- Inspect desktop/mobile arrival and settled framing, including 320/390px
  mobile widths; retain motion accessibility and check asset size/performance.
- Show each candidate for owner acceptance before replacing its live element.

## Sources and preparation

Generate original-art text prompts through the owner's shared Copilot browser.
Do not upload project code, private references or credentials. Retain supported
full-resolution downloads, prompt revisions, provider/conversation links,
terms checks, checksums, preparation recipes and owner feedback in this library.
No supporting candidates have been generated or downloaded for this brief yet.

## Decision history

| Date | Owner feedback | Scope | Remaining choice |
|---|---|---|---|
| 2026-10-10 | Apply the successful process to all remaining homepage elements | Supporting-element redesign commissioned; house stays accepted | First gate design |

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
above remain pending generation and review.

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
