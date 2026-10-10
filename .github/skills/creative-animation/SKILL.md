---
name: creative-animation
description: "Use when making or changing Grim Gatherings animations, haunted houses, backgrounds, illustrations, creative elements, or design quality; preserve approved artwork, research reusable references, clarify scope, and record user choices."
---
# Repeatable creative animation workflow

## Read first

- [Creative library](../../../creative-library/README.md): preserved versions, asset storage, and reuse.
- [Design preferences](../../../creative-library/preferences.md): confirmed choices and unresolved questions.
- [Main-page composition baseline](../../../creative-library/projects/main-page-animation/composition-baseline.md): the owner's saved image for layout, density, and element relationships. Open the linked image before designing the main-page animation.
- [Source catalog](../../../creative-library/references.md): original sources and verification limits.
- [Existing animation guide](../../../BACKGROUND-ANIMATION-GUIDE.md): scene construction, preparation, controls, and validation.
- [Brief template](../../../creative-library/templates/design-brief.md): record a project's intent and approval.

## Page-specific scenes, shared quality process

- The exterior house is the main-page first impression only. Its composition image does not set the layout, density, objects, or palette for other pages.
- The create-a-game section should change to an animated interior that feels like being inside the house. The exact room, artwork, layout, motion, and transition are not selected yet.
- Each game should have its own distinct animated background suited to its setting/story. Those game animations have not been built yet; do not mark them complete or merely recolor the homepage.
- Reuse research, preparation techniques, legally usable elements, accessibility, and quality checks across scenes, not the same finished background everywhere.
- Identify the target page/section or game in its brief, then use that scene's references and approved baseline. Homepage-only objects such as graves, gates, and the moon are not universal requirements.
- This direction is a design roadmap, not a request to implement all future scenes immediately. Preserve existing runtime behavior until a scene is explicitly commissioned.

## Before changing anything

1. Inspect the live scene, local source, deployment revision, and existing worktree changes. Preserve the current version before editing. Never overwrite an archive or unrelated work.
2. Identify the specific approved version. "The first house" is not enough to identify a revision: compare the preserved earlier estate with the live version and ask the owner which they mean.
3. Ask one focused question at a time for choices that change the design. Start with what must stay and the exact requested change. Do not invent approval if the owner is unavailable: preserve the live scene and prepare an isolated candidate or research only.
4. Use the brief template for substantial creative work. Include the approved baseline, focal artwork, protected details, desired change, target screens, and observable acceptance criteria.
5. For the main page, use two distinct baselines: the owner's latest selected house protects its design; the composition image establishes layout and density. The owner confirmed the restored first house and explicitly commissioned a slightly wider reconstruction plus randomized shadow visits through all windows. That is not permission to switch designs or stretch the entire image. Do not confuse a rejected reconstruction experiment with a finished rebuild.

## Research and asset preparation

1. Reuse approved local artwork and layered-scene techniques before sourcing replacements. Inspect the actual assets; a filename or search thumbnail is not a visual quality check.
2. When new artwork is necessary, research the focal element first, then matching supporting elements. Suggested search phrases are in the source catalog. Search results are leads, not proof of availability, permission, or quality.
3. Record the actual source URL, creator, license URL, access date/status, AI disclosure, intended use, and modifications. Never claim a blocked source was verified. Do not substitute an unverified asset or hotlink it.
4. Keep legally retainable originals and editable working files in the creative library, outside the published asset directory. Save crop coordinates, dimensions, masking method, tool/settings, and a reproducible recipe or processing script when preparation is needed.
5. Preserve proportions, transparency, rooflines, entrance, architectural identity, palette, depth, and detail. Composite against the intended scene to inspect alpha edges, lighting, and seams.

## Design and review

1. Lock approved artwork. A request for width, scale, framing, or spacing is not permission to replace the house, redraw it in a different style, splice on wings, duplicate facade sections, or stretch its proportions.
2. Distinguish a wider viewport/composition from a wider building. If the building itself must be rebuilt, ask for a reference and agree the approach first. Preserve its established design language; show a still candidate before adding motion.
3. Maintain one cohesive detailed illustration whose elements share perspective, lighting, and quality. For the exterior, this includes gates, fences, trees, paving, lanterns, weather, and the focal building; other scenes use their own appropriate elements. Effects must not conceal poor artwork.
4. Compare that scene's approved baseline and candidate at the same viewport and animation time. Review a still first, then any entrance and steady state. Check focal-element integrity, scene-specific alignment, breathing room, readable UI, and no accidental crop or distortion. Exterior checks include the full building, front-door/path alignment, and connected gates/fences; they do not prescribe an interior or game's composition.
   For the main page, also compare against the saved composition image: prominent mansion, substantial framing trees on both edges, layered near/far graves and monuments, ground fog, and a populated moon/cloud/rain/bat/lightning sky. Check spatial coverage, relative scale, overlap, and depth, not just whether each element exists. Record deliberate departures; do not silently thin out the scene or substitute architectural identity.
5. Present uncertain design changes for approval before replacing the live version. Keep experiments separate. Never interpret silence or a prior guide's "approved" label as new owner approval.

## Motion and verification

1. Preserve each scene's existing behavior and performance unless explicitly changing them. The manor's one-time arrival is homepage-specific, not a mandatory entrance for every game or interior. Carry effects-off and reduced-motion support into new scenes; define their motion/transition behavior in their own briefs.
2. Check free physical/virtual memory before tests, builds, or browser work. Pause heavy work below the project's memory thresholds; use one targeted job/browser at a time and clean up task-owned processes.
3. For manor changes, run the focused structural tests and relevant browser checks documented in the guide. Confirm visible motion at meaningful times, responsive framing, controls, contrast, and no console/network errors. Structural tests alone do not prove visual quality.
4. Update related cache tags only when runtime files actually change. Verify the deployment package excludes the creative library and contains the approved runtime assets.
5. Publish authorized review candidates to the GitHub Pages test site on `main` first. The `.com` site on `production` requires explicit final owner approval for the exact reviewed commit; test publication never authorizes promotion. Follow the [release approval instructions](../../instructions/release-approval.instructions.md). Preserve the chosen version and verification evidence before publishing.

## Learn from each choice

Record the date, the owner's actual feedback, selected baseline/candidate, scope, and approval in the project's brief. Update the preferences only with confirmed reusable lessons; keep guesses and unresolved questions labeled. Improve the workflow from real failures and successes without rewriting the historical record.
