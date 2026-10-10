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

## Test publication and continuation

The shadow-only candidate was committed as
`e2b1f43856e6c1eceb2b7ba585b6cddd46c28fcb` and published on `main`.
The served scene renderer, homepage initializer, stylesheet, and HTML were
checked against that revision. Production remained at
`2222137cc56fd5a4f9370058a7500308253bfc3d`, and its served renderer still used
the replacement house. This is deployment verification, not browser motion
or visual-quality verification.

At 10:10 on 2026-10-10, the continuation memory check reported 1.79 GB free
physical memory and 16.33 GB free virtual memory. No unrelated applications
were terminated. The owner was unavailable to authorize closing applications
or confirm that memory had been freed.

A lightweight inventory of the asset and creative-library directories found
no layered house source in SVG, PSD, ORA, KRA, or XCF format. The prepared
flattened PNG is not an editable architectural source. Do not describe
pixel-strip expansion as dismantling and rebuilding it. Resume reconstruction
with separately prepared components and continuous matching infill only when
the result can be visually inspected; keep it isolated until that inspection
passes.

## Local editor and new verification

The owner authorized a local image-editor installation. GIMP 3.2.4 was
installed through Windows Package Manager. No artwork was uploaded to an
external service. After the owner closed applications, memory recovered above
the pause threshold; GIMP jobs and browser checks ran sequentially and exited.

A new layered reconstruction experiment preserved architectural pixels but
introduced new connecting masonry and roof material. Direct still inspection
showed visible roof joins and mismatched wall texture. It was rejected, its
preview and candidate XCF were removed, and no runtime artwork changed.
Installing an editor does not by itself supply the missing painted detail.
The wider reconstruction remains unfinished.

Instead, the intact approved house is now preserved in
[an editable nine-region GIMP document](working/first-house-components.xcf).
The regions separate the visible gables, facade bays, and foreground.
They are visible-source cutouts, not recovered original painting layers or
complete hidden architectural pieces. Nothing is widened or repositioned.
The [preparation script](working/prepare-house-layers.py) checks visible RGB
and every alpha value against the approved PNG, then reopens the saved document
and repeats that check. Fully transparent RGB values are irrelevant.

To regenerate the document locally from the repository root:

```powershell
$env:GEGL_THREADS = '1'
& "$env:LOCALAPPDATA\Programs\GIMP 3\bin\gimp-console-3.exe" `
  --no-data --no-fonts --no-splash --new-instance `
  --batch-interpreter=python-fu-eval `
  --batch "import runpy; runpy.run_path(r'creative-library\projects\main-page-animation\working\prepare-house-layers.py')" `
  --quit
```

Check project memory thresholds before regenerating. The original asset is
read-only input; the document and script stay outside the deployment allowlist.

Real Chromium and WebKit browser checks now pass at 320, 390, 768, 1280, and
1408 pixels wide. They verify all seven visible window visits, invisible travel,
actual animation-iteration renewal without restarting the timeline,
window clipping, effects-off, reduced motion, return-home behavior, alignment,
and no page errors. The earlier browser-verification memory blocker is resolved;
these tests do not make the rejected wider artwork acceptable.

## Additional local reconstruction tool

At 11:26 on 2026-10-10 the owner explicitly authorized finding, downloading,
and installing needed tools and material. This does not approve different
house artwork or production promotion.

G'MIC 4.0.5's portable Windows command-line build was downloaded from the
[official download page](https://gmic.eu/download.html) using
[the official package link](https://gmic.eu/get_file.php?file=windows/gmic_4.0.5_cli_win64.zip).
The package was inspected and extracted under the user's local Programs
directory, without changing system PATH or replacing another installation:

```text
%LOCALAPPDATA%\Programs\Gmic-4.0.5\gmic-4.0.5-cli-win64\gmic.exe
```

Downloaded archive SHA-256:
`3F7AE429FA9758DB41DAE89D3FDC048E60D5D7E820E9FF03419C5BD7A10C2D95`.
This is a recorded local checksum, not a publisher-signature verification.
The archive includes its `COPYING` license file. The installed executable
reports version 4.0.5.

A 64 x 64 synthetic-image patch-inpainting test succeeded with five-pixel
patches, a twelve-pixel lookup area, and one OpenMP thread. It uses local pixels
only, without a model download or artwork upload. This verifies the tool runs;
it does not establish acceptable reconstruction quality for the house.

```powershell
$env:OMP_NUM_THREADS = '1'
$gmic = "$env:LOCALAPPDATA\Programs\Gmic-4.0.5\gmic-4.0.5-cli-win64\gmic.exe"
& $gmic --help inpaint
# Quote selectors and bracketed arguments explicitly in Windows PowerShell.
# Example for separate RGB source and grayscale mask images:
& $gmic 'source.png' 'mask.png' '-inpaint[0]' '[1],5,12,0.5,1,3,0' `
  '-remove[1]' -output 'candidate.png'
```

Candidate source/mask/output files must stay in the creative working area.
Preserve unmodified architectural pixels outside the mask and compare the
result against the original before accepting it. Patch synthesis is useful
for texture continuity, not a guarantee of correct roof geometry or lighting.
Resynthesizer's official project reports no tested Windows GIMP 3 build and
provides no Windows release asset; no unverified binary was installed.

### Actual-house patch test

The first actual-house G'MIC experiment used an 812 x 900 canvas, translating
three visible source regions by 0, 18, and 36 pixels without scaling. Only
opaque gaps between them were masked. Local patch synthesis used patch size
7, lookup size 26, lookup factor 0.5, increment 1, and blend size 3, with one
processing thread and a three-minute subprocess timeout. All RGB outside the
mask was explicitly restored from the source after processing.

Direct inspection showed corrupted roof-trim continuations and conspicuous
vertical wall artifacts. The experiment therefore failed the architectural
quality requirement, despite successful processing. Its temporary input,
mask, output, preview, and script were removed. No runtime changes were made.
Do not represent successful inpainting execution as a completed faithful
reconstruction or repeat the same narrow-gap strategy as a new approach.

## Reference-guided generation proposal

At 12:00 on 2026-10-10 the owner supplied three additional reference images,
said they were not fully satisfactory, and asked whether generating elements
one at a time through Copilot would be better. This is an exploration of a
workflow, not approval of a new house or a completed generated asset.

- The first image is a broad abandoned wooden house photographed at an angle:
  useful for connected building mass, not the approved masonry style.
- The second is a narrow monochrome house between large trees: useful for
  framing and depth, not a width solution.
- The third shows a warm-windowed gothic house and moon with a visible
  Dreamstime watermark. Treat it as a composition reference only. Do not
  remove the watermark, extract its artwork, or copy its distinctive design.
- Source links and usage rights for these attachments were not provided.
  Their read-only attachments were not modified or uploaded elsewhere.

Generate the complete focal building before generating independent supporting
objects. Separately generated roof and wall pieces may disagree in perspective,
scale, lighting, and style. Keep the existing foreground and weather until a
new focal-building still is accepted.

### Initial original-art prompt

```text
Create one original, detailed gothic haunted-house illustration as an isolated
building, viewed nearly straight on with slight natural perspective. Use a
broad, cohesive three-story facade with three pointed gables, aged green-gray
cut-stone masonry, ornate carved stone window surrounds, dark weathered
rectangular roof shingles, and a centered entrance with stone steps. Warm
amber light glows behind seven facade windows: three upper, two middle,
and two lower, with the central balcony and entrance between the side windows.

Make the connected building substantial and moderately wider rather than
stretching any window, door, column, or roof detail. Keep a complete roofline,
plausible continuous masonry, consistent cool upper-left exterior lighting,
and readable architectural detail. Give the house a hand-crafted gothic
storybook illustration finish, not a flat icon or a photograph.

Show the entire building and steps with clear margins. Use a transparent
background if supported; otherwise a plain neutral background with a clean
silhouette. No trees, graveyard, people, sky, moon, pumpkins, text, logos,
watermarks, extra wings, duplicated facade strips, or disconnected roof pieces.
```

This prompt expresses design requirements without copying the newly supplied
stock references. It has not been submitted to an image generator. A new
generation cannot be assumed to preserve the approved illustration exactly.
Compare its still against the approved original and obtain owner approval
before runtime integration. Provider, generation settings, output dimensions,
usage terms, prompt revisions, and owner feedback must accompany any output.

The exact previously used Copilot image service is still unidentified, and
this session has no established image-generation connection. The owner can
run this prompt in their image creator and return the result for inspection;
do not imply that a generated candidate already exists.

### Browser image creation verified

The owner signed into Microsoft Copilot directly in the shared VS Code browser
and confirmed access. A text-only original-house prompt was submitted through
the chat composer. No project files, source images, reference attachments,
credentials, or private conversation history were submitted.

Copilot returned a generated image, 1024 x 1536 pixels, with Edit and Download
controls. Direct visual inspection showed cohesive detailed gray-green masonry,
amber lighting, three gables, a centered balcony and entrance, but a tall
portrait building and a plain dark background. Its design differs from the
approved original. It is a workflow trial, not an approved replacement.

The generated conversation is available in the owner's account at
[the browser conversation](https://copilot.com/chat/conversation/1b2b1e09-826e-4de9-ade0-5e0cc04d6b3c).
No login/session URLs or tokens are saved here.

The Download control was clicked, but browser automation did not receive a
download event. Do not claim that a local original file was saved. The browser
image was inspected through an element screenshot, which is not a substitute
for the original asset. Verify download separately before integration.

A second text-only prompt requested a landscape 3:2 canvas and a building
width about 1.15 times its height, excluding the steps. This is an exploratory
generation target, not the owner's requested percentage or approval. It retains
three gables, seven principal facade windows, masonry, lighting and centered
entrance while asking for continuous wider connecting walls. Review the result
before claiming the width target was met.

The second generation completed at 1536 x 1024. Its inspected still shows a
broader coherent three-gabled facade with continuous masonry and roofing,
but a more regular, symmetrical architectural style than the original. It
also retains a solid dark background and an additional glazed central balcony
opening; do not claim exact seven-window compliance or transparent output.
The wider design is pending owner review, not approved for integration.
The original test-site house, shadow geometry, and production remain unchanged.

A third text-only revision requested worn masonry, chipped trim, gently uneven
rooflines, a recessed wooden balcony door instead of the extra glazed opening,
and a plain white background. The 1536 x 1024 result was visually inspected:
it shows seven glowing facade windows and coherent connected roof/walls, but
remains a newly generated, relatively symmetrical interpretation of the house.
It is not an exact reconstruction of the original and has no owner approval.

The [saved review preview](previews/copilot-weathered-house-review.png) is an
element screenshot of the displayed browser image, **not the downloaded
full-resolution original**. Do not use that preview as the production asset.
The generation and revision workflow is verified; original-download handling,
provider usage-term verification, background removal, exact opening geometry,
and owner acceptance remain prerequisites for integration.

An additional original-download attempt used the displayed image's existing
data URL with a browser download link. The controlled browser again emitted
no download event within fifteen seconds. No full-resolution original was
saved by that attempt. Do not repeatedly retry the same download mechanism
or label the review screenshot as the original. The owner can save the image
directly through the visible browser controls and attach the resulting file.

## Accepted generation and local preparation: 2026-10-10

This later decision supersedes the pending-acceptance/download statements
above. The owner said **"i like it"** about the third weathered generation,
then **"we need to do this process for every image element we will use to
make our animations this works well"**. Use this generate/review/refine/save
workflow for new elements, with matching scene lighting/perspective and
individual review. Do not replace previously approved assets automatically
or build future interiors/game scenes without their own briefs.

The exact [original PNG](originals/copilot-weathered-house-original.png) was
recovered from the displayed image's existing data URL and decoded locally
after the browser Download event failed. It is 1536 x 1024, 2,677,656 bytes,
SHA-256 `25076CE4545C357097543A46DB344C39E4FA4C45A4A3FC8DA02C7AC8CDC8FDAE`.
The screenshot remains review evidence only. This is a newly generated design,
not a pixel-identical rebuild. No user reference artwork was uploaded.

The [source catalog](../../references.md#accepted-microsoft-copilot-generation-2026-10-10)
records the official Microsoft AI Services terms checked, output-use
limitations, AI disclosure, and derivative hash. Microsoft does not claim
ownership; that does not guarantee copyright rights or make the image CC0.
Keep the unchanged source and its embedded provenance.

### Reproducible preparation

- GIMP 3.2.4 batch, `GEGL_THREADS=1`, using the
  [saved script](working/prepare-generated-house.py).
- Flood only edge-connected pixels where RGB minimum is at least 225 and
  maximum-minus-minimum is at most 22. Keep bright disconnected architectural
  details. Crop x48, y8, width1440, height996, without scaling architecture.
- Save the [lossless cutout](working/copilot-weathered-house-cutout.png);
  reopen and compare alpha everywhere and RGB on every nontransparent pixel.
- Proportionally resize to 1080 x 747 for the runtime copy; reopen and verify
  all visible resized pixels/alpha. RGB under fully transparent pixels may
  normalize during PNG export and is intentionally not used as visual evidence.
- First full-resolution runtime exceeded the existing 2.5 MB asset budget.
  The resized derivative is 1,568,394 bytes and passes that budget.
- Full source and cutout remain outside the published runtime allowlist.
  The earlier house PNG and nine-region XCF are untouched.

### Scene geometry and visual review

New display x978, y315, width720, height498 preserves the source ratio.
The step center in the unscaled crop is x720, y990, mapping to the existing
path/gate anchor x1338, y810. Width is 39.3% above the earlier517; this is the
accepted generated candidate's scene size, not a newly claimed owner target.
The complete roof and base fit at entrance and settled camera scales.

Seven lower glass-pane bounds in SVG scene coordinates:

| Window | x | y | width | height |
|---|---:|---:|---:|---:|
| Upper left | 1114 | 449 | 32 | 37 |
| Upper center | 1317 | 443 | 41 | 40 |
| Upper right | 1531 | 449 | 32 | 37 |
| Middle left | 1107 | 565 | 43 | 43 |
| Middle right | 1524 | 565 | 43 | 43 |
| Lower left | 1107 | 692 | 43 | 43 |
| Lower right | 1524 | 692 | 43 | 43 |

Each bounds has two pane subpaths with a three-unit central gap. This keeps
the shadow and illumination off the center mullion and carved gothic arch;
decorative upper glass and fine diamond lattice retain original artwork.
The balcony's wooden door and ground-door transom are excluded from the
seven-window itinerary. Random order, renewal and invisible travel remain.
No additional candle sprite was attached to an old window coordinate;
existing eight separate lantern flames remain at their original positions.

Directly inspected [desktop arrival](previews/house-1408-arrival.png),
[desktop settled](previews/house-1408-settled.png), and
[mobile settled](previews/house-390-settled.png) screenshots. The source cutout
and dark scene show the complete continuous building with no white background
rectangle or obvious fringe. The wider facade remains prominent, edge trees,
graves, gates, moon, bats and weather remain, and the path meets the steps.
Some desktop left-side graveyard detail remains behind UI by existing design;
this change does not claim to implement every monument in the reference.
The settled screenshots include a paused lightning flash, not a permanent
change to the scene palette.

Validation:

- Sixteen targeted Node manor/build-packaging tests passed, one worker.
- Chromium and WebKit passed five widths (320,390,768,1280,1408), decoding
  the new PNG, alignment/proportions/framing, seven distinct visible shadow
  visits, mullion/sky clipping, hidden travel, real cycle renewal, lightning,
  controls, reduced motion and one-time arrival/navigation, no page errors.
- Editor diagnostics found no errors in changed runtime/JS test files.
- Cache chain advanced consistently to `manor-generated-v13`.
- Test publication is authorized; `.com` promotion is not.
