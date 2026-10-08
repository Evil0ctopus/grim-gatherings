# GRIM GATHERINGS — UNIVERSAL RULE SETS

**GAME TYPES.** When submitting a game, the author chooses a game type:
**NARRATIVE MYSTERY** or **SOCIAL DEDUCTION**. The chosen type's rule set
applies for testing, error correction, and game flow.

---

## CATEGORY 1 — NARRATIVE MYSTERIES

### UNIVERSAL STORY RULESET

These rules apply to ALL narrative mysteries, free and premium.
This version replaces the previous rule set in full.

**What changed in this version:**
- §5: added minimum round count (N−1) and the chain-ends exception for player counts where no closing chain exists (proven for 4 players).
- §6: added the repeat-gap rule (no pairing in consecutive rounds); repeat rounds should be framed as closing-evidence chapters.
- §7: added the chain-consistency rule (a reader's clue target must be the next reader).
- §11: added the beat-ledger check for major rewrites (recommended).
- §12: added the authoring-scaffolding mapping ("What Players Know" / "Suspicion Board").
- §18: acceptance checklist updated to match.
- §20 (new): rule amendment process — author states the exception, admin approves; unapproved deviations are defects.
- §21 (new): story completion grade — rule-compatibility score from the §18 checklist, with critical gates; 85% minimum to submit for testing and to publish.
- Restructured into two categories with a game-type choice at submission: CATEGORY 1 narrative mysteries (§§1–21), CATEGORY 2 social deduction games (§§22–32, genre-general with room for creative variants).
- §34 (new): least-invasive repair doctrine — rearrange before rewriting, small additions before restructuring; never change solution or evidence spine for compliance; document every intervention.

1. STORY OWNERSHIP

The site owner adds and updates stories through VS Code.

Visitors cannot:
- Create or edit stories.
- Use an AI story helper.
- Import or export story JSON.
- Submit community stories.

2. ONE FIXED PLAYER COUNT PER STORY

Each story has ONE edition at ONE fixed player count.

The number of players is dictated by the playable characters in the
authored story.

Every playable character is required and assigned to exactly one player.
Do not add, remove or make characters optional to fit the code.

The host does not count as a player unless also playing a character.

Odd AND even player counts must work.
The code fits the story—not the other way around.

3. REQUIRED GAME FLOW

SETUP
- Create a game.
- Enter exactly the required number of players.
- Choose the story.
- Assign every character.
- Host privately reviews the story.
- Open the room for players to join.

INTRODUCTION
- Host reads the complete opening narration aloud.
- Every player reads their character card aloud.
- Optional introduction discussion may follow.

EVERY ROUND
1. Host reads the full round narration aloud.
2. Players read their clues in the precomputed order.
3. Every player reads exactly one clue.
4. Everyone deliberates after all clues have been read.
5. Everyone votes.
6. Advance to the next round.

FINALE
- Read the final accusation setup.
- Players make final accusations.
- Cast the final vote.
- Release the fixed reveal.
- Read the complete solution.

No skipping deliberation or voting between rounds.
No revealing the solution before the final accusations and final vote.

4. CHARACTER CARDS AND PUBLIC INFORMATION

Character cards establish:
- Name.
- Role.
- Public relationship to the story.
- Relevant public introduction.

All evidence required to solve the mystery must be read aloud.

Players must not need to:
- Invent a backstory or evidence.
- Read the host's private review screen.
- Know an outside book, film or historical case.
- Learn an essential solving fact only during the reveal.

The host's review screen contains preparation material and spoilers.
It is not read aloud to players.

Optional murderer-identity notification is a host setting.
The story must work with that setting on or off.

5. ONE CLUE PER PLAYER ABOUT ANOTHER CHARACTER

Every player reads one clue about ANOTHER playable character each round.

Within a round:
- Nobody targets themselves.
- Every player reads exactly once.
- Every character is targeted exactly once.
- No target is repeated.
- No player is omitted.
- Every assigned clue is read exactly once.

Across the first N-1 rounds, where N is the player count:
- Every reader targets every other character exactly once.
- No ordered reader-to-target pair repeats.
- Total required coverage is N × (N-1) ordered pairs.

A reading about B is different from B reading about A.

Never reuse the same clue in another round.

ROUND COUNT
- A story must contain at least N-1 rounds, where N is the player count.
- Rounds beyond coverage use the §6 repeat exception.

CHAIN-ENDS EXCEPTION
- For player counts where a closing chain is impossible (proven for
  4 players), the round's reader sequence does not loop back to the
  first reader: the final reader's clue targets an already-read player
  and the chain ends.
- In such rounds one character may be targeted twice and another not
  at all; the per-round uniformity rules above are relaxed accordingly.
- Every player still reads exactly once per round, and full N×(N-1)
  coverage across N-1 rounds is still required.

6. STORY-REQUIRED REPEAT EXCEPTION

Additional rounds may repeat reader-to-target pairs ONLY when:
- The story requires those additional rounds.
- Complete coverage has already occurred.
- The author explicitly documents the reason.
- The extra rounds are marked as coverage repeats.
- Every repeated pair receives new evidence or a meaningful correction.

REPEAT GAP
- No reader-to-target pair may appear in two consecutive rounds.
- At least one full round must separate a pairing from its repeat.

FINALE FRAMING
- Repeat rounds should be presented as closing-evidence chapters that build toward the finale, not as further opening investigation.
- The final repeat round should leave the table holding the complete evidence picture before final accusations.

This exception does not permit:
- Repeated targets within one round.
- Missing readers.
- Incomplete coverage.
- Reused clue text.
- Changing the cast during play.

Blackwater Row's approved exception:
- Four players and five rounds.
- All twelve ordered pairs are covered in rounds 1–3.
- Rounds 4–5 repeat pairs with new evidence.
- Five deaths require five separate story chapters.

7. PRECOMPUTED READING ORDER

Clue targets, chains and coverage are authored before play.

Each round has one complete, unbroken reader sequence containing
every playable character.

CHAIN CONSISTENCY
- For every reader except the last in a round's sequence, that reader's
  clue target MUST be the next reader in the sequence.
- The final reader's clue may target an already-read player; the chain
  then ends instead of looping.
- A round whose targets do not match its reader sequence is broken.
  This is never a valid exception.

Do not regenerate assignments during the game.
Do not change the cast or order when a phone disconnects.

Preserve:
- accuses targets.
- Authored chains.
- chainIndex and turn advancement.
- Fixed cast.
- Fixed solution.

The full clue-chain diagram is not displayed.

Instead, show a prominent turn indicator:
- Who is reading.
- Their assigned player's name.
- Whether a guest is next or waiting.
- A completion message when everyone has read.

Turn changes must be accessible to screen readers.

8. EVERY CLUE HAS TWO PARTS

PART ONE — OBSERVATION
What I witnessed, heard, found, read or learned about the target.

PART TWO — DOUBT OR COMPLICATING DETAIL
My worry, uncertainty, contradiction or reaction to that observation.

Keep these three fields:
- observation
- contradictingDetail
- text

The text field combines both parts for reading aloud.

The second part may strengthen suspicion, weaken it, expose a timing
problem or distinguish suspicious behavior from proof of murder.

9. FIRST-PERSON, “LIVING IT” VOICE

Players read AS their characters.

Use natural first-person speech:
- “I saw…”
- “I heard…”
- “I found…”
- “I read…”
- “I learned…”
- “That worries me…”
- “I can't explain…”

Past tense describes what happened.
Present tense expresses the speaker's current reaction.

Both parts belong in the character's mouth.

Do not write:
- Case files.
- Police reports.
- Detective instructions.
- Narrator paragraphs.
- Editorial advice to players.

Avoid language such as:
- “Test both rather than ignoring either.”
- “Document access makes the secretary worth questioning.”
- “The same person supplies a useful sighting.”

Keep the source of knowledge truthful.
If another witness saw something, say:
“I heard Nell saw…”

Do not change that into:
“I saw…”

unless the reader actually witnessed it.

10. SHORT PLAYER CLUES

Aim for roughly 20–30 words per complete clue.

Hard maximum:
35 words before character-name substitution.

A clue should fit into one or two breaths.

During a rewrite, every clue must be shorter than its original.

Cut:
- Repeated setup.
- Scene-setting already covered by narration.
- Throat-clearing.
- Report-style instructions.

Do not cut the actual observation or the complicating detail.

The narrator tells the story.
The player's clue is the lived moment and personal reaction.

11. FACTS AND SUSPICION BALANCE STAY INTACT

A voice rewrite is not a plot rewrite.

Preserve:
- Witness and source.
- Assigned target.
- Event, location and timing.
- Objects and identifying details.
- Evidence.
- Red herrings.
- Corrections to earlier suspicion.
- Killer, motive, method and opportunity.
- Solvability.

Do not:
- Invent new sightings or evidence.
- Invent motives or alibis.
- Turn uncertainty into certainty.
- Make the killer more obvious.
- Clear someone the original left uncertain.
- Treat a rumor, stain, secret or grievance as proof by itself.

Later clues may correct earlier suspicions.
Those corrections must remain part of the evidence progression.

BEAT LEDGER (recommended)
- Major rewrites should be checked against the story's beat ledger —
  evidence, suspense, doubt and red herrings, motive, texture — to
  confirm nothing material was lost or weakened.

12. NARRATOR TEXT AND SUPPORTING DETAIL

Narrator text may be third person.

An ordinary player-clue voice rewrite does not change narration.

If essential supporting evidence cannot fit into a short clue, an
explicit supporting-detail pass may move it into the SAME round's
read-aloud narration.

When doing so:
- Preserve every material fact.
- Keep it in its original round.
- Do not reveal later evidence early.
- Do not hide it in private host notes.
- Keep the player clue short and focused on its target.
- Ensure narrator callouts match the actual reader order.
- Document and test the change.

Blackwater Row uses this approach:
its full original witness accounts remain in their original chapters,
followed by short first-person player reactions.

AUTHORING SCAFFOLDING
- "What Players Know" and "Suspicion Board" sections are authoring
  scaffolding, not site UI.
- Items that restate a clue's observation are redundant with the clue
  and are dropped in conversion.
- Items that summarize established evidence may fold into the host's
  read-aloud round narration.
- Do not add a suspicion-board interface to the site; deliberation and
  voting cover it.

13. PLACEHOLDERS AND TARGETS

Every {placeholder} must resolve to a valid character in that story.

During a voice rewrite:
- Do not invent placeholder names.
- Preserve existing placeholder names in their clue fields.
- Keep every accuses target unchanged.
- Keep routing and solution data unchanged.

Text changes must not silently alter gameplay.

14. DEATH AND GHOST RULES

Ghosts apply ONLY when the authored story calls for a dead playable
character to return as a ghost.

Do not add ghosts automatically.

If a playable character becomes a ghost:
- The story defines when it happens.
- Their participation and information are authored.
- They remain in required reading order and coverage.
- They cannot invent supernatural knowledge.

If no playable character dies, there are no ghost roles.

Non-player victims do not eliminate players.

Blackwater Row's four playable characters remain alive.

15. DELIBERATION, VOTING AND REVEAL

Every round requires discussion and voting after all clues are read.

Votes record the group's accusations.
Votes do not change the fixed murderer or rewrite the ending.

Final accusations and the final vote happen before the reveal.

The reveal must:
- Name the killer.
- Explain motive, method and opportunity.
- Connect evidence already heard.
- Explain important red herrings and corrections.
- Resolve the story clearly.

Do not introduce a previously unavailable essential clue as the only
reason the killer can be identified.

16. PREMIUM AND STORY-SPECIFIC MECHANICS

All premium narrative stories follow this same flow.

Story-specific mechanics live ON the loop, not BESIDE it.

They cannot bypass:
- Read-aloud introduction.
- Character cards.
- Ordered two-part clues.
- Complete coverage.
- Deliberation and voting.
- Final accusations.
- Fixed reveal.

Do not create a separate faction or night-action flow alongside
the narrative mystery.

17. CONTENT AND INTERFACE

Stories must be:
- Suspenseful.
- Clear.
- Non-graphic.
- Natural to read aloud.
- Solvable without outside knowledge.

Provide appropriate content notes.
Do not add gore or profanity during rewrites.

The interface must stay clean:
- High-contrast gold-on-black styling.
- Readable text and clear spacing.
- Comfortable phone tap targets.
- Prominent reader indicator.
- No displayed clue-chain list.
- Styled in-app confirmations instead of native browser popups.

18. ACCEPTANCE CHECKLIST

CONTENT
[ ] Every required character and round exists.
[ ] Every clue has an observation and complicating detail.
[ ] Both parts use natural first-person speech.
[ ] Complete clue text is at most 35 words.
[ ] Rewritten clues are shorter than their originals.
[ ] Facts, sources and suspicion balance are preserved.
[ ] Placeholders are valid and preserved.
[ ] Evidence remains in the correct round.
[ ] All essential evidence is spoken aloud.
[ ] Spoken spot-checks sound like people, not reports.

GAMEPLAY
[ ] One fixed player count per story.
[ ] Odd and even counts work.
[ ] No self-targets.
[ ] Every player reads once per round.
[ ] Every character is targeted once per round (chain-ends rounds excepted — see §5).
[ ] Every reader's clue target is the next reader in the sequence (final reader exempt).
[ ] Story has at least N-1 rounds.
[ ] Complete ordered-pair coverage precedes repeats.
[ ] No pairing repeats in consecutive rounds.
[ ] Extra-round exceptions are explicitly documented.
[ ] Reader sequences are complete and unbroken.
[ ] Narrator callouts match the actual order.
[ ] Disconnections do not change assignments.
[ ] Every round includes deliberation and voting.
[ ] Final accusations and final vote precede reveal.
[ ] Ghosts exist only where authored.

TECHNICAL
[ ] Full unit suite passes.
[ ] Build checks pass.
[ ] Target values match the pre-edit baseline.
[ ] Unrelated gameplay fields remain unchanged.
[ ] Any narration changes are explicitly scoped and verified.
[ ] Browser tests pass.
[ ] A full host-and-every-player game reaches the reveal.
[ ] Save, reload and reconnect work.
[ ] Murderer-notification settings do not break play.

RELEASE
[ ] Commit verified changes.
[ ] Push the testing branch.
[ ] Verify the testing deployment.
[ ] Publish the approved production branch.
[ ] Verify served content on both websites.
[ ] Complete live gameplay checks.
[ ] Tell testers to start a new game rather than resume old story text.

19. CURRENT STORY COUNTS

FIVE PLAYERS
- The Last Seance at Ravenmoor.
- The Ashes of Mercy Hollow.
- Footsteps Above Blackthorn Farm.
- The Last Will at Briar House.
- The Lanternfall Covenant — premium.
- The Black Ledger Society — premium.

FOUR PLAYERS
- The Barber of Blackwater Row — available for playtesting.

20. RULE AMENDMENTS

This rule set keeps every story playable as its author intends it to be
played. It is the default, not a suggestion.

A story may carry exceptions, but only by this process:
- The author states the requested exception explicitly: which rule, and
  why the story needs it.
- The admin approves or rejects it.
- Approved exceptions are documented in the story's own notes (the §6
  Blackwater Row exception is the model). They are never silent
  deviations.
- Anything deviating without approval is a defect, not an exception.

Submission flow: the author submits the story against this rule set;
the compatibility grade (§21) catches errors; the author fixes them or
requests an amendment.

21. STORY COMPLETION GRADE

Every submitted story receives a compatibility grade: how completely it
satisfies this rule set. The grade is computed from the category's
checklist (§18 for narrative mysteries, §32 for social deduction games).

CRITICAL ITEMS — all must pass; any failure caps the grade at D:
[ ] Every reader's clue target is the next reader in the sequence (final reader exempt).
[ ] Complete ordered-pair coverage precedes repeats.
[ ] Story has at least N-1 rounds.
[ ] No self-targets; every player reads exactly once per round.
[ ] Every placeholder resolves to a valid character.
[ ] The reveal exists, names the killer, and explains motive, method, and opportunity.

SCORED ITEMS — weighted percentage satisfied:
- Structure & flow — 25%: one fixed player count; deliberation and voting every round; final accusations and final vote before the reveal; character cards read aloud.
- Clue craft — 30%: every clue has observation + complicating detail; first-person lived voice; at most 35 words.
- Content integrity — 25%: facts, sources, and suspicion balance preserved; evidence in its correct round; no invented facts; essential evidence spoken aloud.
- Repeat discipline — 20%: repeats only after complete coverage; no pairing in consecutive rounds; new evidence or meaningful correction per repeat; exceptions documented.

Grades: A 95–100, B 90–94, C 80–89, D 70–79, F below 70.
Any critical failure caps the grade at D until fixed.

Automated where possible: chain consistency, coverage, round count,
self-targets, placeholder validity, and word counts are checked by the
unit suite. Voice, suspicion balance, and evidence placement are
reviewed by a human, AI-assisted.

Minimum 85% to submit for testing. Minimum 85% to publish; revisions
may continue after testing.

---

## CATEGORY 2 — SOCIAL DEDUCTION GAMES

### UNIVERSAL SOCIAL DEDUCTION RULESET

These rules govern hidden-role social deduction games: Mafia, Werewolf,
and games like them. They describe the genre, not one game — variants,
custom roles, and creative presentation are expected.

22. CATEGORY DEFINITION

A social deduction game gives every player a secret role, divides roles
into factions (usually an uninformed majority against an informed
minority), and alternates secret actions with open discussion and
voting until a faction meets its win condition.

The site's Mafia mode is the first implementation of this category.

23. HIDDEN ROLES

Every player receives exactly one secret role when the game starts.

Roles stay secret except through the game's defined reveal mechanics
(such as revealing on elimination).

The system must never leak roles: not in the interface, not in logs,
not in sounds, not in timing. Role assignment is random every game —
replayability is the point.

24. FACTIONS AND WIN CONDITIONS

Roles belong to factions. The standard shape is an uninformed majority
against an informed minority; solo or third-party roles are allowed
when explicitly defined.

Every faction has an explicit win condition. Win conditions are checked
after every elimination, and the game ends immediately when one is met.

Every faction must be able to win at every supported player count.

25. PHASE STRUCTURE

Play alternates between a secret phase and a public phase:
- SECRET PHASE: private role actions, run by the moderator. No open discussion.
- PUBLIC PHASE: open discussion, then a vote.

Each game defines its own phase names, order, and contents, but every
game must define: what happens in each phase, who acts, and how play
advances. No phase may be skipped.

26. SECRET ACTIONS

Secret-phase actions are private:
- Acting players learn only their own results.
- Non-acting players learn nothing beyond the action's public effects.
- Selections that must be blind stay blind.
- The order and timing of secret actions must not leak information.

27. DISCUSSION AND VOTING

Every public phase includes discussion and a vote to eliminate a
player.

Tie resolution must be defined before play. Votes are recorded.
Elimination announcements follow the game's defined reveal rule: the
eliminated player's role is revealed or not, per that rule — never
both ways in one game.

28. ELIMINATION

Players are eliminated by vote, by role action, or both.

Each game defines what elimination means for participation (default:
eliminated players become silent observers).

Edge cases — simultaneous eliminations, a faction wiped out at once —
must resolve to a defined ending, never a stuck game.

29. MODERATOR

A moderator runs the phases: human or automated (such as a one-phone
narrator console). The moderator holds all secrets and never reveals
them.

Prompts, sounds, pacing, and narration must not leak hidden
information. When in doubt, the moderator says less.

30. ROLE SETS AND BALANCE

Each supported player count has a defined role set (which roles, how
many of each).

Custom and new roles are welcome. Each must define: its faction, its
action, when it acts, and how it interacts with every win condition.

Role ratios must keep the game winnable for all factions — no
auto-win setups at any supported count.

31. STYLE AND CREATIVE ADDITIONS

Sound effects, images, themes, animation, narration flavor, and custom
roles are encouraged — they are how a game in this category gets its
identity.

Creative additions must not leak hidden information and must not break
the phase structure. Examples: elimination and victory sounds, role
art, themed moderator narration.

32. ACCEPTANCE CHECKLIST

CONTENT
[ ] Every supported player count has a defined role set.
[ ] Every faction has an explicit win condition.
[ ] Every custom role defines faction, action, timing, and win-condition interaction.
[ ] Tie resolution is defined.
[ ] Elimination reveal rule is defined and consistent.
[ ] Eliminated-player participation is defined.

GAMEPLAY
[ ] Roles are secret at deal and stay secret except by defined reveals.
[ ] Nothing leaks roles: interface, logs, sounds, or timing.
[ ] Phases run in the defined order; none can be skipped.
[ ] Win conditions are checked after every elimination.
[ ] The game ends immediately when a condition is met.
[ ] No stuck states: every edge case resolves to a defined ending.
[ ] Role sets are winnable by all factions at every supported count.
[ ] A full game reaches an ending; re-deal starts clean.

STYLE
[ ] Creative additions do not leak hidden information.
[ ] Creative additions do not break the phase structure.

Scored under §21 against this checklist; the same 85% thresholds apply.

---

## REPAIR DOCTRINE

### 34. LEAST-INVASIVE REPAIR

When a story fails compatibility, fix it with the smallest intervention
that achieves compliance. Prefer, in order:

1. REARRANGE — move existing content before changing it. Reassign
   pairings, reorder chains, or shift content between rounds where the
   rules allow. (Example: swapping which pairing set a round uses rather
   than rewriting its clues.)
2. SMALL ADDITIONS — add the minimum needed: a round to reach N−1, a
   missing reveal, a clarifying narration line. Additions must follow
   the story's existing voice and evidence.
3. TARGETED REWRITES — rewrite only the failing elements: the broken
   chain links, the over-long clues, the invalid placeholders. Do not
   rewrite passing content "while you're in there."

Never, in the name of compliance, alter what §11 protects: the killer,
motive, method, opportunity, evidence spine, and suspicion balance. Do
not rewrite content that already passes.

If no minimal fix achieves compliance, the change is no longer minimal:
send it back to the author under §20 rather than reshaping the story
unilaterally.

Document every intervention: what changed, which rule required it, and
what the original said. The author must be able to see exactly what
compliance cost their story.
