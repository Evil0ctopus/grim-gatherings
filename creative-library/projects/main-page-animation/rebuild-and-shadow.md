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
