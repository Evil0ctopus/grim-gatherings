---
description: "Use for all Grim Gatherings changes and releases: test-site review first, explicit owner approval before production."
applyTo: "**"
---
# Test first; production requires final approval

- All tests, changes, and review candidates go to https://evil0ctopus.github.io/grim-gatherings/ first. GitHub Pages deploys `main`.
- https://grimgatherings.com/ is the final-approved production site. Cloudflare Pages deploys the separate `production` branch.
- A request to publish to the test site authorizes pushing `main` only. It does not authorize updating `production`, deploying the `.com` site, or promoting a tested change automatically.
- Promote only the exact reviewed commit after the owner explicitly approves it for `.com`. Confirm the tested commit, preserve intervening changes, and never force-push.
- Verify the test site's served code after deployment and confirm production remains unchanged. Report the test URL and pending production approval.
- Both sites share a backend. Static test-site approval does not authorize backend, database, payment, secret, or hosting changes that could affect production.
