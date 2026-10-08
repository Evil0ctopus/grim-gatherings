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
    ['The bridge lamp log bears {ada}’s initials beside the eight-o’clock wick change. The brass key kept on her belt fits the lamp’s service lock, though the entry alone does not show whether she altered the flame.'],
    ['The ward register records {ada} moving the bridge seal after the first lantern dimmed. Its wax impression matches the seal she carried at the public renewal, not the older seal she said she had used.'],
    ['A soot line on {ada}’s sleeve matches the bridge lamp’s lower vent. She said she checked it only from the path, but the vent can be reached only by opening the service hatch.'],
    ['The final wick was cut with {ada}’s short maintenance shears, identified by the crescent notch in their handle. She had reported those shears missing, yet their oil-dark case remained in her tool basket.'],
  ],
  bryn: [
    ['The bell-listener’s slate shows {bryn} marked the orchard lantern as steady at nine. The matching chalk dust is on the slate hinge, although the clean slate face he described had already been wiped.'],
    ['A recording cylinder catalogued by {bryn} contains the double bell strike that followed the orchard flame going out. He said the cylinder was blank, but its wax groove carries a fresh impression.'],
    ['The listening map in {bryn}’s case places the last sound at the orchard post. He claimed to have stayed in the belfry, yet mud from that post is pressed into the map’s folded edge.'],
    ['The bell rope was tied off with {bryn}’s distinctive square knot. He said no one could reach the rope after the doors were sealed, but the knot lies on the public side of the latch.'],
  ],
  cato: [
    ['The orchard keeper’s basket shows {cato} carried lamp oil to the renewal. He called it cider for the guests, but the bottle bears the lampwright’s measuring mark beneath its paper label.'],
    ['A strip of silvered glass recovered from {cato}’s orchard press fits the lantern’s cracked viewing pane. He said the pane broke in the storm, though the glass edge is cleanly scored rather than wind-shattered.'],
    ['The orchard gate tally puts {cato} at the boundary after midnight. He blamed a fallen branch, but the gate’s inner bar was lifted from the lantern side and left no branch fibers.'],
    ['Ash from the orchard lantern was wrapped in {cato}’s harvest cloth. He said the cloth had never left his shed, yet the damp ash has the same cedar scent as the shed’s open brazier.'],
  ],
  dara: [
    ['The covenant clerk’s draft, signed by {dara}, changes the boundary wording the day before the death. She said the copy was made after the meeting, but the ink beneath the seal is still wet in the preserved fold.'],
    ['A brass pin from {dara}’s map case fits the loose lantern latch. She denied carrying metal tools, though the empty pin slot in her case has fresh green tarnish around it.'],
    ['The deed map in {dara}’s desk moves the boundary line beyond the orchard. She called it an old survey, but the paper’s watermark dates it to the week Orren died.'],
    ['Orren’s sealed note names {dara} as the only person who requested the unlit route. She said he never trusted her with the covenant, yet her own initials appear beside the route on his carbon copy.'],
  ],
  elan: [
    ['The bridge watch roster places {elan} at the crossing when the first lantern dimmed. He said he saw no one, but his boot print beside the post has the heel split shown on his own roster sketch.'],
    ['A lantern-glass shard in {elan}’s coat pocket fits the bridge lamp’s missing panel. He blamed the broken window at the watch hut, but that window is intact and has no matching edge.'],
    ['The watch bell’s spring was replaced by {elan} that afternoon. He described it as a repair to the clock, while the spring’s hooked end matches the release inside the bridge lantern.'],
    ['A damp footprint beneath {elan}’s window faces outward toward the boundary path. He claimed he slept through the alarm, but the mud contains the fresh brass dust found only at the lantern posts.'],
  ],
};

const ledgerFacts = {
  alice: [
    ['The auction register signed by {alice} lists the reserve seal as intact at opening. She said she sealed it after the last bid, but the impression beneath her signature is from the earlier, broken wax.'],
    ['A correction in {alice}’s lot book moves one receipt to the reserve column. She called it a copyist’s mark, yet the red pencil stroke crosses the printed total instead of the handwritten note.'],
    ['The witness docket records {alice} announcing a reserve loss before the counting bell. She said the figure came from the clerk, but her own pocket tally contains the same number in older ink.'],
    ['The closing sheet prepared by {alice} shows the reserve was opened with two keys. She said both were present, but one key’s brass dust appears only on the bidder’s ledger page.'],
  ],
  ben: [
    ['The escrow cabinet log bears {ben}’s initials beside the reserve key. He said it stayed in the cabinet all evening, but the key’s fresh wax smear matches the opened seal.'],
    ['A shield receipt in {ben}’s case lists a bidder who was already absent. He called it a routine duplicate, yet the receipt carries a new counterfoil number not found in the cabinet copy.'],
    ['The escrow balance sheet shows {ben} restored one credit after a loss. He said the adjustment was automatic, but the ink begins under the line where he denied opening the reserve.'],
    ['The cabinet hinge carries a strand from {ben}’s blue cuff. He said the door never moved, although the strand is trapped beneath the newest layer of polishing wax.'],
  ],
  celia: [
    ['The debt index copied by {celia} lists two bidders against one receipt number. She said the duplicate was a harmless filing error, but both entries carry separate reserve totals.'],
    ['A torn counterfoil in {celia}’s desk matches the counterfeit batch. She said it came from discarded drafts, yet its punched corner matches the live auction book.'],
    ['The daily sum in {celia}’s ledger omits a reserve loss announced at noon. She blamed a slow clerk, but the missing line was cut out with a ruler and the page number continues.'],
    ['The final index in {celia}’s hand marks one debt as paid. She said the mark was copied from a receipt, but the ink contains the same silver fleck found on the forged originals.'],
  ],
  dario: [
    ['The bidder card signed by {dario} claims he left before the first lot. The auction bell record places his bid after that time, and the card’s reverse has a fresh carbon transfer.'],
    ['A counterfeit receipt bears {dario}’s uncommon crossed-seven mark. He called it the clerk’s handwriting, but his signed bid sheet uses the same doubled stroke.'],
    ['The reserve tally puts {dario}’s debt among the losses. He said his account was settled, yet his own pocket copy still shows the unpaid amount in wet red ink.'],
    ['The hidden escrow key was wrapped in {dario}’s lot catalogue. He denied entering the cabinet, but the catalogue’s torn edge matches the paper caught in its lock.'],
  ],
  eva: [
    ['The advocate’s note shows {eva} objected to the reserve transfer before the auction. She said she only questioned the fee, but her underlined copy names the exact missing receipt.'],
    ['A chalk total on {eva}’s sleeve matches the counterfeited debt sum. She said it came from the bidding board, though that board used black ink and was wiped before the chalk appeared.'],
    ['The sealed complaint filed by {eva} identifies a gap in the reserve count. She said she filed it the next morning, but the seal has the prior evening’s bell stamp.'],
    ['The final account in {eva}’s folder clears a bidder who paid in cash. She said the receipt was verified, yet the paper is watermarked with the same false reserve series.'],
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
      const text = input.characters.find(item => item.id === targetId).evidence[roundIndex][0];
      return {
        readAloud: {
          accuses: targetId,
          text: `{${targetId}}: ${text}`,
          observation: text.split('. ')[0],
          contradictingDetail: text.split('. ').slice(1).join('. '),
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
