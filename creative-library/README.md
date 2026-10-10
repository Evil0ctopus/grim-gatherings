# Grim Gatherings creative library

This is the project's persistent design memory and working area. It is not a
public stock-asset collection. The existing live house and runtime paths are
unchanged by its creation.

## Start here

- [Design preferences and open questions](preferences.md)
- [Owner's main-page layout and density baseline](projects/main-page-animation/composition-baseline.md)
- [Recovered source catalog and renewed research](references.md)
- [Repeatable animation workflow](../.github/skills/creative-animation/SKILL.md)
- [Accepted generated house and per-element workflow](projects/main-page-animation/rebuild-and-shadow.md#accepted-generation-and-local-preparation-2026-10-10)
- [Existing construction and image-preparation guide](../BACKGROUND-ANIMATION-GUIDE.md)
- [New design brief template](templates/design-brief.md)
- [Preserved house versions](snapshots/README.md)

## Where things belong

| Area | Purpose |
|---|---|
| `snapshots/` | Immutable ZIP archives with source revision and SHA-256 checksums. Never replace a snapshot. |
| `projects/<project-name>/` | A brief, candidate previews, editable artwork, preparation recipes, and approval history for each design. |
| `projects/<project-name>/originals/` | Legally retainable source files with source/license records; do not offer these as stock downloads. |
| `projects/<project-name>/working/` | Cutouts, masks, layered documents, and reproducible preparation scripts. |
| `projects/<project-name>/previews/` | Baseline/candidate stills and animation-review evidence at documented viewport sizes and times. |
| [Published assets](../assets/) | Only optimized, approved artwork actually used by the site. Do not move existing files. |

Create a project's subfolders when there is material to store; do not fill them
with placeholder assets. [The projects area](projects/README.md) explains how to
start. Current reusable house assets already exist locally and are preserved in
the snapshots; this task did not download replacement artwork.

The static builder publishes only its explicit site files and the `assets`,
`css`, `js`, and `vendor` directories. This root-level library is outside that
allowlist. Keep source originals and experiments here rather than under `assets`,
which is copied in full during builds.

## Reuse rather than reinvent

The shared workflow applies across the site; the main-page image does not.
The homepage is the exterior first impression, the create-a-game section is
intended to feel inside the house, and individual games need distinct animated
settings that have not been built yet. Read the
[page-specific direction and status](preferences.md#page-specific-scene-direction-confirmed-at-0949-on-2026-10-10)
before choosing references. Create a separate brief for each scene when its work
begins rather than copying the homepage composition everywhere.

Begin with the approved complete focal artwork, its proportions, its layers,
and the preparation guide. A request to make a scene wider is not an instruction
to switch houses. If changing the building itself is necessary, clarify and
review a candidate before replacing anything live.

After the owner makes a choice, record it in the project's brief. Promote only
confirmed general preferences into [the preference record](preferences.md).
Keep historical snapshots and their labels unchanged.
