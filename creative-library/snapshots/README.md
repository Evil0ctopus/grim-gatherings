# Preserved house versions

Archives are immutable development copies, not standalone stock downloads.
Their [manifest](manifest.json) records revisions and SHA-256 checksums.

| Archive | Meaning |
|---|---|
| `live-house-2222137.zip` | Current house at deployed commit `2222137cc56fd5a4f9370058a7500308253bfc3d`. Keep this live unless the owner requests a change. |
| `earlier-detailed-estate-040e240.zip` | Earlier detailed estate before the complete-house replacement. Candidate for the owner's preferred earlier animation, not yet confirmed. |

On 2026-10-10, the live `js/manor.js` matched local HEAD after normalizing CRLF/LF.
The latest successful Pages deployment also identified that HEAD revision:
[deployment run](https://github.com/Evil0ctopus/grim-gatherings/actions/runs/38025725994).
Archive integrity and other live runtime comparisons are recorded in the manifest.
The live homepage HTML additionally contains a hosting-injected Cloudflare
analytics script; that hosting behavior is not part of the source archive.

Each ZIP contains the static site's tracked pages, `assets`, `css`, `js`, and
`vendor`, plus the package manifest, lockfile, build script, and manor tests
present at that revision. Assets retain their original names and relative paths.
Git archives on this Windows checkout contain CRLF text exports. Content checks
against Git blobs normalized CRLF/LF for text only; image bytes matched exactly.
The earlier archive also preserves prepared elements no longer used by the
current scene. Existing uncommitted documentation is not part of these Git
snapshots and has not been overwritten.

## Inspect or restore safely

1. Verify the ZIP with `Get-FileHash -Algorithm SHA256` against the manifest.
2. Extract into a new, empty review folder with `Expand-Archive`. Do not extract
   over the live worktree. Review with an appropriate local HTTP server rather
   than opening the ES-module app as a `file:` page.
3. Compare a still and the animation to the owner's reference before selecting
   a version. Full application behavior may depend on the existing hosted
   services; a source archive is not a backup of remote service data.
4. If restoration is requested, compare archived files with current ones and
   apply only the approved visual changes. Preserve intervening app changes,
   credits, accessibility, controls, and cache-tag consistency.

Never edit either archive in place. Save a newly approved design as a new
snapshot with a new revision and checksum.

For a future snapshot, use `git archive --format=zip` with the chosen revision
and the same explicit file/directory selection in the manifest. Choose a new
filename, check that it does not exist, verify the exported contents, and record
its checksum. Do not silently archive uncommitted runtime changes as if they
belonged to a committed revision.
