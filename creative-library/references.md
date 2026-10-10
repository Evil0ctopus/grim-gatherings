# House reference catalog and research

Recovered from the project's [artwork credits](../how-to-play.html#image-credits),
[animation guide](../BACKGROUND-ANIMATION-GUIDE.md), and Git history.
Renewed public-source research was performed on 2026-10-10.

## Owner-supplied composition reference

The owner reattached the [main-page baseline](projects/main-page-animation/composition-baseline.md)
on 2026-10-10 and explicitly confirmed that it establishes layout, element
density, and the desired scene elements. The unchanged image is saved with its
record, separate from runtime assets. Creator, original source, license, and AI
status were not supplied; do not invent them or assume permission to publish,
extract, or redistribute its artwork. Use it for visual comparison.

## Existing reusable elements

| Local element | Role | Recorded source |
|---|---|---|
| [Earlier detailed mansion](../assets/estate-cartoon-manor.png) | Restored focal-house candidate after the owner's correction; also source for pillar texture | [Pixabay mansion 9805270](https://pixabay.com/illustrations/haunted-mansion-spooky-house-9805270/) |
| [Editable first-house regions](projects/main-page-animation/working/first-house-components.xcf) | Nine source-pixel regions for local editing; no widening or new artwork. [Preparation recipe](projects/main-page-animation/working/prepare-house-layers.py) verifies lossless recomposition and saved-document round-trip. | Derived from the earlier mansion; same source/license record and verification limits |
| [Archived replacement mansion](../assets/estate-complete-manor.png) | Replaced focal building, retained unchanged in the archive and asset library | [Pixabay / PixelLabs 9859927](https://pixabay.com/illustrations/haunted-house-abandoned-house-9859927/) |
| [Withered tree](../assets/estate-withered-tree.png) | Detailed trees at multiple scales, mirrored as needed | [Pixabay tree 9379381](https://pixabay.com/illustrations/withered-tree-dead-tree-9379381/) |
| [Iron ornament](../assets/estate-illustrated-gate.png) | Cutout detail inside complete constructed gate frames | [Pixabay / Art_Dreams 7570954](https://pixabay.com/illustrations/haunted-house-gate-stairway-manor-7570954/) |
| [Pillar texture](../assets/estate-stone-pillar.png) | Subtle detail over constructed masonry | Derived from the earlier mansion; same source/license record |
| [Candle](../assets/estate-candle.svg) | Illustrated flame in shaded lanterns/title | Existing project SVG; inspect source/history before unrelated redistribution |
| [Fog](../assets/fog.svg) | Repeating textured atmospheric layer | Existing project SVG; inspect source/history before unrelated redistribution |
| [Scene renderer](../js/manor.js) and [styles](../css/style.css) | Paving, gate structure, lantern housings, depth, weather, motion | Existing project implementation; reuse the archived version |

The earlier photograph experiments and first simple drawn manor are historical
alternatives, not instructions to replace the live house.

## Verification and rights

- Existing credits identify the sourced illustrations as AI-generated and
  adapted under the [Pixabay Content License](https://pixabay.com/service/license-summary/).
- Recorded preparation includes cropping, proportional resizing, color grading,
  mirroring, background removal, and texture extraction. The detailed recipe,
  recorded dimensions, crop coordinates, and rejected approaches are in the
  [existing guide](../BACKGROUND-ANIMATION-GUIDE.md#4-how-we-searched-prepared-and-refined-the-design).
- Renewed search returned a gate-source lead, but did not reliably verify the
  exact mansion/tree IDs. Direct checks of both mansion pages and the license
  summary returned HTTP 403. This is an access limit, not proof that a source
  was removed or its license changed.
- No new downloads or replacement artwork were accepted from search summaries.
  Original unprocessed downloads and the original temporary image-processing
  helpers were not recovered. The bundled prepared elements and earlier scene
  are available; do not pretend this is a complete original-source archive.
- Before a new download or new use, check the actual source, creator, license,
  AI disclosure, and applicable restrictions. Do not redistribute extracted
  imagery as standalone stock assets. Keep credits with adaptations.

## Repeatable search approach

These are reusable search phrases, not a claimed verbatim transcript:

```text
gothic haunted mansion illustration transparent background
detailed spooky estate cartoon wide composition
ornate wrought iron gate haunted house illustration
withered dead tree illustration transparent
site:pixabay.com/illustrations haunted mansion
site:pixabay.com/illustrations withered tree
```

1. Start by looking at the approved baseline and naming the actual problem.
2. Reuse its artwork first. Research replacements only if needed and approved.
3. Compare focal-art candidates for full silhouette, architectural identity,
   detail, transparency, aspect ratio, lighting, perspective, and framing.
4. Research supporting elements separately so their quality matches the house.
5. Open real source pages, inspect downloaded files, and record rights/status.
6. Review a still composition before spending time on animation.

## Record every new source

In the project brief or adjacent source record, save: local filename, source
URL, creator, license URL and verification date/status, AI label, permitted use,
original dimensions, derivative filenames, preparation recipe/tool settings,
owner approval, and any limits. A blocked page stays unverified until checked.

## Targeted reconstruction research on 2026-10-10

The owner explicitly authorized web searching for additional image elements.
No private project images or code were uploaded. Public searches used only
the recorded public source ID and generic material descriptions.

### Exact house source

Search results attributed Pixabay illustration `9805270` to `SerenityArt` and
suggested [this creator profile](https://pixabay.com/users/serenityart-38608329/)
and [related illustration 9796296](https://pixabay.com/illustrations/haunted-mansion-spooky-halloween-9796296/).
These are **unverified leads**, not confirmed creator/provenance records.
The source, profile, related illustration and license pages still returned
HTTP 403 during direct checks. Search results did not establish original pixel
dimensions. No Pixabay artwork was downloaded or accepted from those results.

### Verified reusable material samples

Official ambientCG asset pages and the
[official license page](https://docs.ambientcg.com/license/) were accessible.
The license explicitly covers downloadable assets and material preview renders
under CC0 1.0, permitting copying, modification and commercial use.
Provider: ambientCG; individual authorship was not established in the inspected
asset metadata. No AI disclosure was found in that metadata; absence is not
proof of a non-AI workflow. Bricks096 explicitly lists Surface Photogrammetry.

| Sample retained unchanged | Official source | Direct sample URL | Dimensions / bytes | Visual assessment and status |
|---|---|---|---|---|
| [Bricks096 color sample](projects/main-page-animation/originals/Bricks096_SQ_Color.jpg) | [Bricks 096](https://ambientcg.com/view?id=Bricks096) | [Source JPEG](https://f003.backblazeb2.com/file/ambientCG-Web/media/surface-preview/Bricks096/Bricks096_SQ_Color.jpg) | 2000 x 1000 / 729462 | Weathered gray/olive rubble masonry with useful surface detail. Stones are more irregular than the house's rectangular blocks. Material donor/reference only, not an approved facade or seamless match. |
| [RoofingTiles001 color sample](projects/main-page-animation/originals/RoofingTiles001_SQ_Color.jpg) | [Roofing Tiles 001](https://ambientcg.com/view?id=RoofingTiles001) | [Source JPEG](https://f003.backblazeb2.com/file/ambientCG-Web/media/surface-preview/RoofingTiles001/RoofingTiles001_SQ_Color.jpg) | 2000 x 2000 / 950884 | Useful aged dark slate color and wear. Its clipped/octagonal tiles differ from the house's straight rectangular shingles. Not accepted as a direct roof replacement. |

SHA-256:

- Bricks096: `4E654CBBCE50013DB0561492CCAB198B60959CFADFA7841A322211920E1795F3`
- RoofingTiles001: `5E351892C50587096CB50354F22B870C3A64F8ADB6699E2518391AFABB1424E7`

Both official asset pages also expose 1K JPG material-pack downloads. Those
packs were not downloaded; only the two inspected color samples were retained.
No crop, recoloring, processing, or runtime use has been performed. Keep these
samples outside published assets and retain this provenance with derivatives.
CC0 does not establish aesthetic compatibility or owner approval.

A search-suggested Poly Haven `stone_wall_003` URL returned 404 and a guessed
ambientCG `RoofTilesSlate001` URL returned 404. Neither is a verified asset.
Do not reuse those URLs as valid sources. Additional searches for exact ashlar
blocks and rectangular roofing did not yield a verified match in this pass.
The wider house remains unfinished; this research does not authorize replacing
it or promoting anything to production.
