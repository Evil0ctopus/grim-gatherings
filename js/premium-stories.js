const chains = [
  ['ada', 'dara', 'bryn', 'cato', 'elan'],
  ['ada', 'elan', 'cato', 'bryn', 'dara'],
  ['ada', 'cato', 'dara', 'elan', 'bryn'],
  ['ada', 'bryn', 'elan', 'dara', 'cato'],
];
const ledgerChains = chains.map(chain => chain.map(id => ({
  ada: 'alice', dara: 'ben', bryn: 'celia', cato: 'dario', elan: 'eva',
}[id])));

const lanternFacts = {
  ada: [
    ["I read {ada}'s initials in the bridge-lamp log beside the eight-o'clock wick change; her belt's brass key fits its service lock.", "I can't tell whether she altered the flame."],
    ["I read the ward register: {ada} moved the bridge seal after the first lantern dimmed.", "I compared its wax: her public-renewal seal, not the older one she claimed."],
    ["I compared {ada}'s sleeve soot with the bridge lamp's lower vent.", "I can't reconcile her path-only check with a vent reached only through the service hatch."],
    ["I identified the final wick's cuts with {ada}'s short maintenance shears, crescent-notched handle and all.", "I question her missing-shears report: their oil-dark case stayed in her tool basket."],
  ],
  bryn: [
    ["I read {bryn}'s slate: orchard lantern steady at nine.", "I saw matching chalk on its hinge; the clean face he described had already been wiped."],
    ["I heard the double bell strike after the orchard flame died on {bryn}'s catalogued cylinder.", "I question his blank-cylinder claim: the wax groove has a fresh impression."],
    ["I read the listening map in {bryn}'s case: last sound at the orchard post.", "I doubt his belfry-only claim with that post's mud pressed into the map's folded edge."],
    ["I recognized {bryn}'s square knot tying off the bell rope.", "I question his sealed-door claim: the knot sits on the latch's public side, where the rope could be reached."],
  ],
  cato: [
    ["I checked {cato}'s basket: he carried lamp oil to the renewal.", "I question his guests' cider claim; the bottle's paper label hides the lampwright's measuring mark."],
    ["I compared silvered glass recovered from {cato}'s orchard press: it fits the lantern's cracked viewing pane.", "I doubt his storm story; that edge is cleanly scored, not wind-shattered."],
    ["I read the orchard gate tally placing {cato} at the boundary after midnight.", "I question his fallen-branch claim: the inner bar lifted from the lantern side, leaving no branch fibers."],
    ["I saw orchard-lantern ash wrapped in {cato}'s harvest cloth.", "I question his shed-only claim; that damp ash smells of cedar, just like the shed's open brazier."],
  ],
  dara: [
    ["I read {dara}'s signed draft changing boundary wording the day before the death.", "I question her after-meeting copy claim: beneath the seal, ink stays wet in the preserved fold."],
    ["I compared {dara}'s brass map-case pin: it fits the loose lantern latch.", "I question her denial of metal tools; fresh green tarnish surrounds the empty pin slot."],
    ["I read the deed map from {dara}'s desk moving the boundary beyond the orchard.", "I doubt her old-survey claim: its watermark dates to the week Orren died."],
    ["I read Orren's sealed note: only {dara} requested the unlit route.", "I question her claim he never trusted her with the covenant; her initials mark that route on his carbon copy."],
  ],
  elan: [
    ["I read {elan}'s bridge-watch roster: at the crossing when the first lantern dimmed.", "I question his no-sighting account; his post-side bootprint has the heel split in his own roster sketch."],
    ["I compared the lantern-glass shard in {elan}'s coat pocket: it fits the bridge lamp's missing panel.", "I doubt his broken-watch-hut-window explanation; that window's intact, without a matching edge."],
    ["I learned {elan} replaced the watch-bell spring that afternoon.", "I question his clock-repair explanation: the spring's hooked end matches the release inside the bridge lantern."],
    ["I saw a damp footprint beneath {elan}'s window facing the boundary path.", "I doubt he slept through the alarm; its mud contains fresh brass dust found only at lantern posts."],
  ],
};

const ledgerFacts = {
  alice: [
    ["I read {alice}'s signed auction register: reserve seal intact at opening.", "I question her after-last-bid sealing claim; the impression beneath her signature comes from earlier, broken wax."],
    ["I read {alice}'s lot-book correction moving a receipt to the reserve column.", "I question her copyist-mark explanation; red pencil crosses the printed total, not the handwritten note."],
    ["I read the witness docket: {alice} announced a reserve loss before the counting bell.", "I question her clerk-supplied figure; her pocket tally has that number in older ink."],
    ["I read {alice}'s closing sheet: two keys opened the reserve.", "I question her both-keys-present claim; one key's brass dust appears only on the bidder's ledger page."],
  ],
  ben: [
    ["I read {ben}'s initials beside the reserve key in the escrow-cabinet log.", "I doubt it stayed inside all evening; its fresh wax smear matches the opened seal."],
    ["I read the shield receipt in {ben}'s case listing an already-absent bidder.", "I question his routine-duplicate explanation; its new counterfoil number isn't in the cabinet copy."],
    ["I read the escrow balance sheet: {ben} restored a credit after a loss.", "I question his automatic-adjustment claim; ink starts beneath his denial of opening the reserve."],
    ["I saw a strand from {ben}'s blue cuff in the cabinet hinge.", "I doubt the door never moved; the strand's trapped beneath the newest polishing wax."],
  ],
  celia: [
    ["I read {celia}'s copied debt index: two bidders share one receipt number.", "I question her harmless-filing-error claim; both entries have separate reserve totals."],
    ["I compared the torn counterfoil in {celia}'s desk: it matches the counterfeit batch.", "I doubt her discarded-drafts explanation; its punched corner matches the live auction book."],
    ["I read {celia}'s ledger: the daily sum omits noon's announced reserve loss.", "I question her slow-clerk explanation; a ruler-cut line is missing, but page numbering continues."],
    ["I read the final index in {celia}'s hand marking one debt paid.", "I question her receipt-copy explanation; the ink has the same silver fleck as the forged originals."],
  ],
  dario: [
    ["I read {dario}'s signed bidder card: gone before the first lot.", "I doubt it; the auction-bell record places his bid later, and the card's reverse carries fresh carbon."],
    ["I recognized {dario}'s uncommon crossed-seven mark on a counterfeit receipt.", "I question his clerk-handwriting claim; his signed bid sheet uses that same doubled stroke."],
    ["I read the reserve tally: {dario}'s debt among the losses.", "I doubt his settled-account claim; his pocket copy still shows the unpaid amount in wet red ink."],
    ["I saw the hidden escrow key wrapped in {dario}'s lot catalogue.", "I question his cabinet-entry denial; the catalogue's torn edge matches paper caught in its lock."],
  ],
  eva: [
    ["I read {eva}'s advocate note objecting to the reserve transfer before the auction.", "I question her fee-only explanation; her underlined copy names the exact missing receipt."],
    ["I compared {eva}'s sleeve chalk total with the counterfeited debt sum.", "I doubt her bidding-board explanation; it used black ink and was wiped before the chalk appeared."],
    ["I read {eva}'s sealed complaint identifying a reserve-count gap.", "I question her next-morning filing claim; the seal bears the prior evening's bell stamp."],
    ["I read the final account in {eva}'s folder clearing a cash-paying bidder.", "I question her verified-receipt claim; its watermark matches the false reserve series."],
  ],
};

const definitions = [
  {
    id: 'lanternfall',
    title: 'The Lanternfall Covenant',
    kind: 'Occult mystery',
    premise: 'A fog-bound village must renew three boundary lanterns after its covenant keeper is found dead.',
    story: {
      schemaVersion: 2, fixedPlayerCount: 5, discloseKiller: false, clueRouting: 'rotating',
      title: 'The Lanternfall Covenant',
      setting: 'A fog-bound village on the night its three boundary lanterns must be renewed.',
      intro: 'Covenant keeper Orren Vale was found dead beside the belfry hours before the annual renewal. By dawn, the Bridge, Orchard and Belfry lanterns had all gone dark. The villagers say the Hollow extinguish lights to cross the boundary, but the keeper’s death and the altered lamps leave a human trail to examine.',
      hiddenThread: 'The Hollow legend conceals a planned land transfer: someone used the three lanterns and a false boundary map to make the village abandon its protected common.',
      specialMechanics: ['The three boundary lanterns carry a sequence of bell marks; their physical state and repair records form the mystery’s evidence trail.'],
      victim: { name: 'Orren Vale', description: 'The village covenant keeper, found dead beside the belfry before the lantern renewal.' },
      rounds: [
        { title: 'Round 1 — Three dark lights', narration: 'At first bell, the village finds Orren Vale beside the belfry door. The Bridge, Orchard and Belfry lamps are dark, but none has burned out naturally: their wicks were cut or their latches opened. The keeper’s public ledger lists the people who handled the lamps during the renewal preparations. No one saw a face in the fog, and the Hollow tale is not proof of a supernatural visitor. Read the first records aloud, then follow the chain of observations.', publicText: 'Orren is dead and all three boundary lanterns are dark. The first records place each character near a lamp.', hostNotes: 'Read the setup and character cards aloud before this round.', events: ['Orren is found dead beside the belfry.', 'All three boundary lanterns are confirmed extinguished.', 'The public lamp-handling ledger is opened.'], chain: chains[0], coverageRepeat: false },
        { title: 'Round 2 — The ward register', narration: 'The lamplighter’s ward register is found under the belfry bell. Its entries do not show a protective charm; they show who opened each service hatch and when. A wax seal on the register differs from the seal used at the public renewal. The bell-listener’s cylinder records a second strike after one lamp went dark. Compare these physical marks with each character’s account before deciding whether the fog or a person changed the boundary.', publicText: 'The ward register and bell cylinder give independent records of the lanterns.', hostNotes: 'Invite the group to compare timestamps and physical traces.', events: ['The ward register is recovered.', 'A second bell strike is placed after the Orchard lamp went dark.', 'The public seal is compared with the register seal.'], chain: chains[1], coverageRepeat: false },
        { title: 'Round 3 — A line moved on the map', narration: 'A survey map is discovered inside Orren’s locked desk. The boundary line has been moved beyond the orchard, and the map’s watermark dates it to the week of his death. The orchard gate tally and the bridge watch marks narrow the time when someone could reach the posts without passing the village square. The evidence does not prove the Hollow exist; it asks who could benefit from changing the covenant and who had access to the lamps.', publicText: 'Orren’s map changes the boundary and is dated to the week he died.', hostNotes: 'Keep the focus on access, records and motive, not supernatural certainty.', events: ['A dated boundary map is found in Orren’s desk.', 'The orchard gate tally is compared with the bridge roster.', 'The changed boundary is connected to a land transfer.'], chain: chains[2], coverageRepeat: false },
        { title: 'Round 4 — The covenant’s last copy', narration: 'Orren’s carbon copy is found beneath the belfry floorboard. It names the person who requested the unlit route and records the original boundary before the map was altered. The lantern hardware, bell marks, gate record and map now form one timeline. The final accusation is about the person who killed Orren and staged the three dark lamps to force a false covenant renewal. The village must decide whether the Hollow were a real faction or a story used to hide a human scheme.', publicText: 'Orren’s carbon copy connects the altered map, the lamps and the planned route.', hostNotes: 'After the chain, open final accusations, then the final vote and reveal.', events: ['Orren’s carbon copy is recovered.', 'The route request is matched to the changed boundary map.', 'The group makes its final accusation and vote.'], chain: chains[3], coverageRepeat: false },
      ],
      characters: [
        { id: 'ada', name: 'Ada Venn', role: 'Lamplighter', relationship: 'Maintains the boundary lanterns for the village.', tieIn: 'Her key and ward register track access to the service hatches.', publicBlurb: 'A careful lamp tender who keeps the village lights burning through heavy fog.', evidence: lanternFacts.ada },
        { id: 'bryn', name: 'Bryn Bell', role: 'Bell Listener', relationship: 'Records the belfry signals used by the covenant.', tieIn: 'His slate and cylinders record when each lantern was heard.', publicBlurb: 'A patient listener trusted to keep the village’s bell records.', evidence: lanternFacts.bryn },
        { id: 'cato', name: 'Cato Reed', role: 'Orchard Keeper', relationship: 'Maintains the orchard boundary and its gate.', tieIn: 'His gate tally and harvest tools place him near the Orchard lamp.', publicBlurb: 'A practical grower who knows every path through the orchard.', evidence: lanternFacts.cato },
        { id: 'dara', name: 'Dara Wren', role: 'Covenant Clerk', relationship: 'Prepared the renewal papers alongside Orren.', tieIn: 'Her drafts and map case connect the lamps to the disputed boundary.', publicBlurb: 'A precise clerk responsible for the village’s covenant records.', evidence: lanternFacts.dara },
        { id: 'elan', name: 'Elan Moss', role: 'Bridge Watch', relationship: 'Patrolled the crossing on the night of the death.', tieIn: 'His roster and repaired watch bell place him at the Bridge lamp.', publicBlurb: 'A steady watchkeeper who knows who crosses the river after dark.', evidence: lanternFacts.elan },
      ],
      finale: { narration: 'The fog thins as the final bell sounds. The villagers lay the altered map beside the original covenant and wait for the group’s accusation.', votePrompt: 'Who caused Orren’s death and used the lanterns to conceal the boundary scheme?' },
      solution: { killerId: 'dara', explanation: 'Dara Wren killed Orren after he discovered her plan to move the village boundary and sell the protected common. She cut or opened each lantern to support the Hollow story, altered the renewal map, and used the unlit route to hide her movements. The seals, service marks, gate tally, bell record and carbon copy connect the physical sabotage to her access and motive.', revealNarration: 'The Hollow were never proved to have crossed the boundary. Dara used their legend as cover: she altered the map, silenced the lanterns and killed Orren to stop him exposing the false renewal.' },
    },
  },
  {
    id: 'ledger',
    title: 'The Black Ledger Society',
    kind: 'Financial mystery',
    premise: 'At a midnight auction, a secret syndicate swaps genuine debt receipts for counterfeits while the reserve begins to collapse.',
    story: {
      schemaVersion: 2, fixedPlayerCount: 5, discloseKiller: false, clueRouting: 'rotating',
      title: 'The Black Ledger Society',
      setting: 'A sealed auction hall at midnight, where five officials and bidders count a reserve under pressure.',
      intro: 'At the close of the midnight auction, the reserve is short and its keeper, Ivo Kane, is found dead beside the escrow cabinet. Counterfeit debt receipts have appeared in the auction books. The bidders whisper about the Black Ledger Society, a syndicate said to forge obligations and erase honest claims. The public registers, cabinet marks and receipts are available to everyone; the group must decide who engineered the fraud and caused Ivo’s death.',
      hiddenThread: 'The Black Ledger Society is a cover for one bidder’s plan to forge debts, drain the auction reserve and buy the disputed mill before its ownership is corrected.',
      specialMechanics: ['The reserve-loss total and silver-flecked receipt series change the value of the auction records each round; the same physical ledger trail drives the mystery and the vote.'],
      victim: { name: 'Ivo Kane', description: 'The reserve keeper, found dead beside the escrow cabinet after the auction.' },
      rounds: [
        { title: 'Round 1 — A short reserve', narration: 'The auction hall is sealed when Ivo Kane is found beside the escrow cabinet. The reserve is short, its wax seal is broken, and one debt receipt appears twice in the register. The opening ledger lists who handled the key, the bids and the reserve count. A society name is written in the margin, but a name is not proof of a secret organization. Begin with the records and identify which claims conflict with the physical evidence.', publicText: 'Ivo is dead, the reserve is short and a debt receipt appears twice.', hostNotes: 'Read the character cards and public auction roles aloud before this round.', events: ['Ivo is found beside the escrow cabinet.', 'The reserve is counted and found short.', 'A duplicate debt receipt is identified in the auction register.'], chain: ledgerChains[0], coverageRepeat: false },
        { title: 'Round 2 — The counterfoil', narration: 'A torn counterfoil is found in the clerk’s desk. Its punched corner matches the live auction book, not a discarded draft. The escrow log records the key’s movement, while the advocate’s sealed complaint carries the previous evening’s bell stamp. The register now shows that the false receipts were prepared before the reserve was counted. Follow the paper’s watermark and ink rather than assuming that every person who handled a receipt made the forgery.', publicText: 'The counterfoil and escrow log narrow when the counterfeit series entered the books.', hostNotes: 'Compare the paper, stamps and key record; no private reports are used.', events: ['A torn counterfoil is matched to the active auction book.', 'The escrow key log is examined.', 'The advocate’s complaint is dated to the prior evening.'], chain: ledgerChains[1], coverageRepeat: false },
        { title: 'Round 3 — The reserve tally', narration: 'The reserve tally is reconstructed from the bid sheets and the sealed complaint. One announced loss was omitted from the daily sum, while a bidder’s pocket copy still records an unpaid amount in wet red ink. The silver fleck in the forged series is also present on the latest index page. Credit and escrow adjustments explain why the public total shifted, but they do not erase the reserve loss. The records now point to a single forged series and a narrow group with access to the cabinet.', publicText: 'The reconstructed count exposes an omitted loss and a forged receipt series.', hostNotes: 'Read the reserve arithmetic aloud and let the group discuss before voting.', events: ['The reserve tally is reconstructed.', 'An omitted loss is found in the daily sum.', 'Silver flecks connect the forged receipt series to the latest index.'], chain: ledgerChains[2], coverageRepeat: false },
        { title: 'Round 4 — The key in the catalogue', narration: 'The escrow cabinet is opened for a final inspection. A hidden key was wrapped in a bidder’s lot catalogue, and its torn edge matches paper caught in the cabinet lock. The closing sheet shows two keys were required, but the brass dust appears on only one bidder’s ledger page. Every clue is now public: the duplicate receipt, counterfoil, omitted loss, forged series and key. Make the final accusation about who forged the debts and killed Ivo to keep the reserve scheme hidden.', publicText: 'The hidden key and closing sheet complete the reserve and receipt timeline.', hostNotes: 'Open final accusations and a final vote before revealing the fixed solution.', events: ['The hidden escrow key is matched to the catalogue and lock.', 'The two-key closing sheet is compared with the bidder ledger.', 'The group makes its final accusation and vote.'], chain: ledgerChains[3], coverageRepeat: false },
      ],
      characters: [
        { id: 'alice', name: 'Alice Quill', role: 'Auctioneer', relationship: 'Ran the midnight auction and signed the opening register.', tieIn: 'Her lot book tracks when reserve totals changed.', publicBlurb: 'A brisk auctioneer who values a clean register and a quick close.', evidence: ledgerFacts.alice },
        { id: 'ben', name: 'Ben Sable', role: 'Escrow Agent', relationship: 'Kept the reserve cabinet and its keys.', tieIn: 'His cabinet log and balance sheet record access and adjustments.', publicBlurb: 'A cautious escrow agent trusted with the sealed reserve.', evidence: ledgerFacts.ben },
        { id: 'celia', name: 'Celia North', role: 'Ledger Clerk', relationship: 'Copied the debts and totals into the auction index.', tieIn: 'Her counterfoils and index preserve the receipt series.', publicBlurb: 'A meticulous clerk who can trace a number across several books.', evidence: ledgerFacts.celia },
        { id: 'dario', name: 'Dario Voss', role: 'Bidder', relationship: 'Held several lots and disputed a debt at the auction.', tieIn: 'His signed bid card and lot catalogue connect him to the forged series.', publicBlurb: 'A confident bidder with a personal stake in the disputed mill.', evidence: ledgerFacts.dario },
        { id: 'eva', name: 'Eva March', role: 'Debt Advocate', relationship: 'Represented bidders whose claims appeared in the reserve.', tieIn: 'Her sealed complaint and account folder expose the missing receipts.', publicBlurb: 'A determined advocate who checks every fee and obligation.', evidence: ledgerFacts.eva },
      ],
      finale: { narration: 'The auction bell is silent. The reserve books, receipts and key lie together on the table as the group prepares its final vote.', votePrompt: 'Who forged the debts, drained the reserve and caused Ivo’s death?' },
      solution: { killerId: 'dario', explanation: 'Dario Voss forged the debt receipts and drained the reserve to gain control of the disputed mill. He used the Black Ledger Society name to make the fraud appear larger than one bidder’s scheme, hid the escrow key in his catalogue, and killed Ivo when the reserve keeper found the duplicate receipt. His crossed-seven mark, unpaid pocket copy, wet red ink, forged series and key evidence connect the fraud to him.', revealNarration: 'The Black Ledger Society was a cover story. Dario Voss made the counterfeit receipts, diverted the reserve and killed Ivo to hide the scheme before the mill’s ownership could be corrected.' },
    },
  },
];

function compileStory(input) {
  const story = structuredClone(input);
  story.characters = story.characters.map(character => ({
    id: character.id, name: character.name, role: character.role,
    relationship: character.relationship, tieIn: character.tieIn, publicBlurb: character.publicBlurb,
    optional: false, guest: '', guestNote: '',
    rounds: story.rounds.map((round, roundIndex) => {
      const chain = round.chain;
      const readerIndex = chain.indexOf(character.id);
      const targetId = chain[(readerIndex + 1) % chain.length];
      const [observation, contradictingDetail] = input.characters.find(item => item.id === targetId).evidence[roundIndex];
      return {
        readAloud: {
          accuses: targetId,
          text: `${observation} ${contradictingDetail}`,
          observation,
          contradictingDetail,
        },
      };
    }),
  }));
  return story;
}

export const PREMIUM_STORIES = definitions.map(definition => ({
  id: definition.id,
  title: definition.title,
  kind: definition.kind,
  premise: definition.premise,
  story: compileStory(definition.story),
}));
