// Built-in mystery: "The Last Séance at Ravenmoor". Works for 3–12+ guests.
// Characters are included in PRIORITY order: the first four alone contain a complete, solvable chain of clues.
// Extra characters add corroborating clues and red herrings. Beyond 12 guests, "mourner" characters are added.
import { shuffle } from './util.js';
import { preparePublicEvidence } from './public-evidence.js?v=public-only-v1';

const BASE = {
  title: 'The Last Séance at Ravenmoor',
  setting: 'Ravenmoor Manor — a crumbling stone estate on the fog-choked moors. Tonight is the first anniversary of Lady Eleanor Ravenmoor\'s death. A storm has washed out the only road. No one leaves until dawn.',
  intro: 'You have been summoned to Ravenmoor Manor by Lord Ambrose Ravenmoor. One year ago tonight, his young wife Eleanor died of a sudden "fever." Now Ambrose has hired a famous medium to call her back from the grave.\n\nThe storm has swallowed the road. The candles are lit around the séance table. The clock in the hall is creeping toward midnight.\n\nSomething in this house is listening.',
  victim: { name: 'Lord Ambrose Ravenmoor', description: 'Master of Ravenmoor Manor. Grieving, obsessive, and lately convinced that his wife Eleanor did not die of fever at all.' },
  rounds: [
    {
      title: 'Round 1 — The Candles Die',
      narration: 'The clock in the hall begins to strike midnight.\n\nMadame Vesper\'s voice rises over the storm: "Eleanor… Eleanor Ravenmoor… if you walk among us, show yourself."\n\nOn the twelfth chime, every candle in the room goes out at once.\n\nDarkness. A cold draft across the back of your neck. Someone gasps. Then — a horrible, wet, choking sound… and the crash of breaking glass.\n\nWhen trembling hands relight the candles, Lord Ambrose Ravenmoor is slumped across the séance table. His lips are blue. His eyes are wide open. His brandy glass lies shattered on the floor.\n\nHe is dead. The road is gone. And one of you did this.',
      publicText: 'Lord Ambrose is dead — struck down in the dark at the stroke of midnight. Blue lips. A shattered brandy glass. No one may leave. Read your new clues, then start asking questions.',
      hostNotes: 'Dim the lights or blow out a candle on the 12th chime for effect. Give everyone 15–20 minutes to mingle and question each other.',
    },
    {
      title: 'Round 2 — The Spirit Speaks',
      narration: 'As the guests argue over the body, the séance table begins to knock. Once. Twice. Three times.\n\nThe planchette slides across the spirit board on its own, slowly spelling out five letters:\n\nT… O… N… I… C.\n\nThen a window bursts open and the wind snuffs half the candles. Somewhere upstairs, a woman is humming "Greensleeves."\n\nLady Eleanor died one year ago tonight. Perhaps she did not die of fever at all.',
      publicText: 'The spirit board spelled T-O-N-I-C. Was Lady Eleanor murdered too? Share your new clues — and your secrets, if you dare.',
      hostNotes: 'Knock three times on the table before reading. Another 15–20 minutes of mingling.',
    },
    {
      title: 'Round 3 — Confessions at the Witching Hour',
      narration: 'It is past one in the morning. The fire has burned down to embers, painting every face in red.\n\nLord Ambrose lies beneath a white sheet. The old house creaks like a ship in a storm.\n\nOne by one, the secrets of Ravenmoor are clawing their way to the surface — stolen silver, hidden debts, forbidden lovers. But only one secret in this room is soaked in blood.\n\nLook at each other\'s hands. Look at each other\'s eyes. Before dawn, you must name a murderer.',
      publicText: 'Final round. The truth is close. Confess what you\'ve been hiding — then decide who killed Lord Ambrose.',
      hostNotes: 'Last mingling round (15 min). Then press "Begin the finale" to open voting.',
    },
  ],
  finale: {
    narration: 'The clock strikes three. The candles gutter low.\n\nIt is time. Each of you must name the one you believe murdered Lord Ambrose Ravenmoor.\n\nChoose carefully. The dead are watching.\n\nCast your vote on your phone — now.',
    votePrompt: 'Who murdered Lord Ambrose Ravenmoor?',
  },
  solution: {
    killerId: 'ashgrove',
    explanation: 'Dr. Silas Ashgrove murdered Lady Eleanor one year ago. She had discovered his fraudulent prescriptions — and the two patients they killed — so he slowly poisoned her "evening tonic" with wolfsbane and signed her death certificate as "fever."\n\nAmbrose grew suspicious, found Eleanor\'s old tonic bottle labelled "S.A." in the doctor\'s hand, and staged tonight\'s séance as a trap: the medium, speaking as Eleanor, would ask "Who gave me the tonic?" while Ambrose watched the doctor\'s face.\n\nBut Ashgrove saw the trap closing. He cut monkshood (wolfsbane) from the conservatory — leaving a trail of soil to his chair — and when the candles died, he leaned across and smeared the poison on the rim of Ambrose\'s brandy glass, whispering "Forgive me, Eleanor." The decanter was clean: Constance drank from it and lived. And the fire\'s glow caught his gold serpent-and-staff signet ring — the physician\'s mark.\n\nThe doctor killed twice — and nearly wrote the second death off as "heart failure" too.',
    revealNarration: 'The candles flare. Dr. Silas Ashgrove rises slowly and peels off his gloves.\n\n"She was going to ruin me," he says softly. "Eleanor would not stop asking questions. And Ambrose… Ambrose would not stop listening to her ghost."\n\nBehind him, in the black glass of the window, for one heartbeat, everyone sees the pale face of a woman in a white gown — smiling.\n\nThen every candle goes out.',
  },
};

// Order matters: first 4 = complete solvable core.
const CHARS = [
  {
    id: 'ashgrove', name: 'Dr. Silas Ashgrove', role: 'The Family Physician',
    publicBlurb: 'Physician to the Ravenmoor family for twenty years. Calm hands, cold eyes. He signed Lady Eleanor\'s death certificate.',
    backstory: 'For two decades you have treated every Ravenmoor cough, fever and broken bone. You are respected, trusted, and quietly rich — because for years you have billed for patients who never existed and sold laudanum to half the county.\n\nLady Eleanor found your ledgers. Two of your "patients" had died. She said she would tell Ambrose. So you mixed wolfsbane into her nightly tonic, a little at a time, and watched her drink it. When she died, you wrote "fever" on the certificate. No one questioned it.\n\nUntil this week. Ambrose has been looking at you strangely.',
    secrets: [
      'You murdered Lady Eleanor a year ago with wolfsbane in her evening tonic.',
      'YOU ARE THE KILLER. Tonight, in the dark of the séance, you smeared wolfsbane paste on the rim of Ambrose\'s brandy glass.',
      'You cut the monkshood (wolfsbane) from the conservatory this evening. There may be soil on your shoes.',
    ],
    motive: 'Ambrose found something of Eleanor\'s that pointed to you. This séance was a trap. You had to silence him before "Eleanor" could speak.',
    rounds: [
      { clues: ['Ambrose\'s blue lips and clutched throat are textbook aconite (wolfsbane) poisoning. You recognise it instantly. Others may not.', '{constance} poured everyone\'s brandy from the decanter before the séance.'], instructions: 'You are the killer — you may lie. Declare it a heart attack: "His heart was always weak." Gently steer suspicion toward Constance, who poured the drinks.' },
      { clues: ['The medium\'s séance is a fraud — you noticed a thin wire under the tablecloth.', 'There is dark soil on your trouser cuff and the toe of your shoe.'], instructions: 'If anyone says "poison," agree it might be — then point out that Madame Vesper controlled the darkness. Who benefits more than a fraud about to be exposed?' },
      { clues: ['Your gold signet ring — a serpent coiled around a staff, the physician\'s mark — may have been glimpsed in the firelight.', 'Eleanor\'s old tonic bottle has turned up. It bears your handwriting.'], instructions: 'Stay calm. If confronted about the bottle, say you prescribed a harmless tonic and someone must have tampered with it later. Never confess — make them prove it.' },
    ],
  },
  {
    id: 'crane', name: 'Hollis Crane', role: 'The Butler',
    publicBlurb: 'Has served Ravenmoor Manor for thirty years. Sees everything. Says little.',
    backstory: 'You were here when Eleanor arrived as a laughing bride, and here when she was carried out in a coffin. You loved her like a daughter.\n\nLately Lord Ambrose has been strange — locking himself in the study, sending you on odd errands, muttering to Eleanor\'s portrait.\n\nAnd you carry your own shame: for years you have been quietly selling the family silver to pay for your sister\'s sanatorium bills.',
    secrets: [
      'You have been stealing and selling the Ravenmoor silver.',
      'You saw something during the séance you are afraid to say — admitting it means admitting you sneaked back into the room to pocket a silver candlestick.',
    ],
    motive: 'If Ambrose discovered the missing silver, you would be ruined and your sister thrown out into the cold.',
    rounds: [
      { clues: ['An hour before the séance you found a freshly cut stalk of tall purple hooded flowers — monkshood — on the conservatory floor, and a trail of dark soil leading toward the séance room.', 'The soil trail ended beside the chair where {ashgrove} sat.'], instructions: 'Share the monkshood and the soil trail — but don\'t say whose chair it led to unless someone presses you. A servant doesn\'t accuse gentlemen lightly.' },
      { clues: ['This morning Lord Ambrose made you fetch a dusty brown medicine bottle from Lady Eleanor\'s trunk in the attic. The label reads "Evening Tonic — S.A." in a neat physician\'s hand.', 'Ambrose told you: "Keep it safe, Hollis. After tonight, the constable will want it."'], instructions: 'Reveal the bottle when anyone asks about Eleanor\'s death. Ask the room: who here signs their name "S.A."?' },
      { clues: ['When the candles died, you were in the doorway, pocketing a silver candlestick. By the dull red glow of the fireplace you saw a hand reach over Ambrose\'s brandy glass — and on that hand, a gold ring: a serpent wound around a staff.'], instructions: 'This truth can end the night. Confess the silver if you must — then describe the ring. Ask everyone to show their hands.' },
    ],
  },
  {
    id: 'constance', name: 'Lady Constance Ravenmoor', role: 'The Sister',
    publicBlurb: 'Ambrose\'s younger sister. Sharp-tongued, beautifully dressed, and — rumour says — next in line to inherit everything.',
    backstory: 'You grew up in this dreary pile of stone and swore you would escape. You did — to Monte Carlo — and lost every penny at the tables.\n\nYou came home to beg Ambrose for money. At dinner he refused, coldly. Then he said something that made your skin crawl: "After tonight, Constance, money will be the least of this family\'s worries. Eleanor will name her murderer."',
    secrets: [
      'You owe a very dangerous man in Monte Carlo four thousand pounds.',
      'You argued with Ambrose at dinner and hissed, "I wish you\'d join your precious Eleanor." Others may have heard.',
    ],
    motive: 'As Ambrose\'s heir, his death makes your debts disappear.',
    rounds: [
      { clues: ['You poured everyone\'s brandy from the crystal decanter before the séance — including your own. You drank it. You feel perfectly fine.', 'Ambrose\'s blue lips… you have seen that once before: on Eleanor, the night she died.'], instructions: 'You will be suspected because you poured the drinks. Defend yourself: you drank from the same decanter — so how could the decanter be poisoned?' },
      { clues: ['At dinner Ambrose told you: "Tonight, Eleanor will name her murderer." He believed she did NOT die of fever.', 'In her final weeks Eleanor complained that her tonic "tasted of pepper" and made her lips go numb.'], instructions: 'Tell the room what Ambrose said at dinner. This séance was never about saying goodbye — it was a trap.' },
      { clues: ['You sniffed the base of Ambrose\'s shattered glass: the rim smells bitter and peppery and makes your lip tingle. The decanter smells only of brandy. The poison was put on HIS glass, in the dark — not in the decanter.'], instructions: 'Clear your name: the poison was added during the séance by someone seated near Ambrose. Ask who sat beside him.' },
    ],
  },
  {
    id: 'vesper', name: 'Madame Vesper Thorne', role: 'The Spiritualist',
    publicBlurb: 'A famous medium hired to contact Lady Eleanor\'s spirit. Smells of incense. Speaks to the dead — for a fee.',
    backstory: 'You were born Mary Higgins in a London gutter and reinvented yourself in velvet and veils. Your séances are legendary — and entirely fake. Your table hides a wire that raps on command, and a bellows pedal under your skirts snuffs every candle on cue.\n\nAmbrose hired you a week ago and paid triple — on one condition: tonight you follow HIS script, word for word.',
    secrets: [
      'You are a fraud. The table is rigged, and you snuffed the candles yourself with a hidden bellows.',
      'Ambrose knew you were a fraud and threatened to expose you unless you performed his script tonight.',
    ],
    motive: 'One letter from Ambrose to the newspapers would have destroyed your career.',
    rounds: [
      { clues: ['At midnight you pressed the bellows and every candle went dark — exactly as Ambrose instructed. In the dark you heard a chair scrape back on the side of the table where {ashgrove} and Ambrose sat.', 'About ten heartbeats later, Ambrose began to choke.'], instructions: 'Don\'t admit the trick yet. Claim the spirits snuffed the candles — something cold passed through the room. Mention the chair scrape as if "the spirit moved among us."' },
      { clues: ['Ambrose\'s script had you speak as Eleanor and ask one question: "Who gave me the tonic?" He planned to watch everyone\'s faces when the lights returned.', 'You never got to say the line. He died first.'], instructions: 'Admit Ambrose paid you to ask "Who gave me the tonic?" — but try to keep your fraud secret. Who in this room would be terrified by that question?' },
      { clues: ['In the darkness, just before Ambrose choked, you heard a man whisper, very close to him: "Forgive me, Eleanor."'], instructions: 'Time for the truth: confess the rigged table if it helps catch a killer. Tell them about the whisper. Whose voice was it?' },
    ],
  },
  {
    id: 'grey', name: 'Father Lucan Grey', role: 'The Priest',
    publicBlurb: 'The village priest, summoned to bless the house. Gaunt, haunted, forever clutching a rosary.',
    backstory: 'You buried Eleanor. You heard her last confession. Since that night you have lost your faith, and you drink to forget the fear you saw in her eyes.',
    secrets: ['You no longer believe in God, and you have been drinking the communion wine.', 'Eleanor\'s last confession was not about sins. It was a warning.'],
    motive: 'Ambrose caught you drunk at the altar and threatened to write to the bishop.',
    rounds: [
      { clues: ['You think this séance is blasphemy. You came only because Ambrose said, "Eleanor deserves justice, Father, not just prayers."'], instructions: 'Loudly declare that the dead should stay buried and this house is cursed. Watch who agrees too eagerly.' },
      { clues: ['Eleanor\'s last words in confession: "Father, if I die, it was not the fever. It is the medicine." You told no one — the seal of confession.'], instructions: 'Wrestle with breaking the seal… then reveal it: Eleanor believed her medicine was killing her.' },
      { clues: ['At Eleanor\'s funeral, after everyone had gone, you saw {ashgrove} alone at her grave, whispering "I had no choice." You thought it was grief.'], instructions: 'Describe what you saw at the graveside. Ask the doctor what he meant.' },
    ],
  },
  {
    id: 'marsh', name: 'Gideon Marsh', role: 'The Solicitor',
    publicBlurb: 'The family lawyer. Precise, nervous, never without his battered leather case.',
    backstory: 'You manage the Ravenmoor fortune — and you have been "borrowing" from it to cover your disastrous investments. So far, no one has noticed.',
    secrets: ['You have embezzled thousands from the Ravenmoor estate.', 'Ambrose summoned you this morning to add a sealed codicil to his will.'],
    motive: 'Ambrose had asked to see the estate accounts next week. An audit would expose your theft.',
    rounds: [
      { clues: ['Ambrose\'s will leaves almost everything to {constance}. Everyone will assume she did it.'], instructions: 'Make sure everyone knows who inherits. Keep attention far away from the estate\'s finances — and from you.' },
      { clues: ['This morning Ambrose added a sealed codicil (an amendment) to his will. You were told to open it only "if I do not survive the night."'], instructions: 'Announce that a sealed codicil exists — but refuse to open it until the next round, however much they beg.' },
      { clues: ['The codicil reads: "If I die tonight, look to the man who signed my Eleanor\'s death certificate. He is her murderer — and now mine."'], instructions: 'Open the codicil and read it aloud to the room. Make it dramatic.' },
    ],
  },
  {
    id: 'pell', name: 'Mother Agnes Pell', role: 'The Cook & Herb-Witch',
    publicBlurb: 'The manor\'s cook and the village wise-woman. Knows every root and leaf on the moor — the healing kind and the other kind.',
    backstory: 'Villagers come to you for remedies when they cannot afford the doctor. Some call you a witch behind your back. You grow strange things in the conservatory — for "warding off evil," you say.',
    secrets: ['You sell love charms and "remedies" that some would call poison.', 'You grow monkshood — wolfsbane — in the conservatory.'],
    motive: 'Ambrose planned to evict you and tear out your garden.',
    rounds: [
      { clues: ['Monkshood — wolfsbane — causes tingling, numbness, blue lips, and a racing heart that suddenly stops. Lord Ambrose\'s body shows every sign.'], instructions: 'Tell everyone it was wolfsbane. You will be suspected — you grow it.' },
      { clues: ['Three weeks ago, a gentleman carrying a doctor\'s bag asked you how much wolfsbane it would take to "stop a strong man\'s heart." He said it was for his studies.'], instructions: 'Mention the gentleman — but say you only saw him in shadow. Let the room guess.' },
      { clues: ['A year ago, Lady Eleanor\'s empty tonic bottles were sent to the kitchen to be washed. They reeked of wolfsbane. You said nothing — who would believe a "witch"?'], instructions: 'Confess what you smelled on Eleanor\'s bottles. Wolfsbane killed her too.' },
    ],
  },
  {
    id: 'finch', name: 'Theodora "Teddy" Finch', role: 'The Journalist',
    publicBlurb: 'A reporter from the London Gazette, here to expose fake mediums. Never without a notebook and a flash camera.',
    backstory: 'You talked your way into tonight\'s séance claiming to be writing a sympathetic piece. In truth you want the scoop of the year: Madame Vesper unmasked.',
    secrets: ['You were secretly fired from the Gazette for inventing a story — you are here under false pretences.', 'You took a flash photograph at the very instant the candles died.'],
    motive: 'Ambrose recognised you and threatened to tell everyone you are a disgraced fraud yourself.',
    rounds: [
      { clues: ['Just before the candles died you saw {vesper}\'s foot press down on something under her skirts. She is a fake.'], instructions: 'Accuse the medium of trickery. Demand to search the séance table.' },
      { clues: ['You took a flash photograph the instant the lights went out. It is developing in your room — you will know more soon.'], instructions: 'Tease the photograph. Watch who suddenly looks nervous.' },
      { clues: ['Your photograph shows a blurred hand reaching toward Ambrose\'s glass. Something gold glints on one finger — a ring shaped like a coiled snake.'], instructions: 'Reveal the photograph. Ask everyone to show you their rings.' },
    ],
  },
  {
    id: 'wren', name: 'Wren Hollow', role: 'Eleanor\'s Lady\'s Maid',
    publicBlurb: 'Lady Eleanor\'s devoted maid. Pale, quiet, still dressed in mourning black. Some say she talks to Eleanor at night.',
    backstory: 'Eleanor was kind to you when no one else was. Since her death you have drifted through the manor like a ghost yourself, keeping her room exactly as she left it.',
    secrets: ['You have been sleeping in Eleanor\'s bed and wearing her perfume.', 'You believe Eleanor\'s ghost truly walks these halls — you hear her humming at night.'],
    motive: 'Ambrose meant to dismiss you after tonight for your "unhealthy devotion."',
    rounds: [
      { clues: ['Eleanor\'s favourite song was "Greensleeves." Just before midnight you heard someone humming it in the hall. No one was there.'], instructions: 'Insist that Eleanor\'s ghost is here. Get the room thoroughly spooked.' },
      { clues: ['In her last month, Eleanor secretly poured her tonic into the plant pots. The plants died. After that, the doctor began giving her the doses himself — and watched her drink.'], instructions: 'Share Eleanor\'s fear of her tonic.' },
      { clues: ['You found a torn page from Eleanor\'s diary tucked inside her prayer book: "…S. knows that I know. He watches me drink every night. If something happens to me—"'], instructions: 'Read the diary page aloud. Ask the room: whose name begins with S?' },
    ],
  },
  {
    id: 'ivy', name: 'Ivy Marchetti', role: 'The Opera Singer',
    publicBlurb: 'A glamorous soprano and Ambrose\'s "old friend." Her laugh fills any room; her eyes miss nothing.',
    backstory: 'You met Ambrose at the opera six months after Eleanor died. He was lonely; you were curious. It became something more.',
    secrets: ['You were Ambrose\'s secret lover.', 'After the body was found you slipped back to it and took your love letters from his coat pocket.'],
    motive: 'Ambrose ended the affair yesterday, cruelly, and you swore he would regret it.',
    rounds: [
      { clues: ['Your lipstick is on Ambrose\'s collar. Someone is bound to notice.'], instructions: 'Be dramatic — faint, weep, sing a mournful note. Keep the affair secret as long as you can.' },
      { clues: ['In Ambrose\'s coat pocket, beside your letters, you found a note in his hand: "Watch S.A.\'s hands when the lights return."'], instructions: 'Admit the affair if pressed — then reveal the note.' },
      { clues: ['Ambrose told you last week: "The doctor killed her, Ivy. I can feel it. I just need him to show himself."'], instructions: 'Share Ambrose\'s words. He was hunting a killer — and the killer found him first.' },
    ],
  },
  {
    id: 'vane', name: 'Captain Rourke Vane', role: 'The Old Soldier',
    publicBlurb: 'Ambrose\'s comrade from the war. Gruff, scarred, and never far from his service revolver.',
    backstory: 'You and Ambrose survived the trenches together. Since then you have survived on cards, whisky, and Ambrose\'s generosity.',
    secrets: ['You owe Ambrose a fortune in gambling debts.', 'You carry a loaded revolver in your jacket.'],
    motive: 'Last week Ambrose called in your debt: pay by Christmas or be ruined.',
    rounds: [
      { clues: ['You sat across from Ambrose. In the dark you smelled something sharp and green — like crushed plant stems — from his side of the table.'], instructions: 'Take charge like a soldier: nobody leaves this room. Mention your revolver to keep order (it makes you look suspicious).' },
      { clues: ['In the war you saw a field surgeon treat wolfsbane poisoning. He said: "Only a doctor or a witch would know the dose."'], instructions: 'Repeat the surgeon\'s words. Look hard at the doctor — and the cook.' },
      { clues: ['When the candles were relit, {ashgrove} was already at Ambrose\'s side feeling for a pulse — before anyone had even screamed. As if he knew.'], instructions: 'Point out how fast the doctor moved. Demand an explanation.' },
    ],
  },
  {
    id: 'blackwood', name: 'Professor Edmund Blackwood', role: 'The Occult Scholar',
    publicBlurb: 'An Oxford expert in witchcraft and the afterlife. He covets the Ravenmoor library of forbidden books.',
    backstory: 'The Ravenmoor library holds a 300-year-old grimoire bound in something that is not quite leather. You have wanted it for a decade.',
    secrets: ['You stole the grimoire from the library tonight; it is hidden inside your coat.', 'You believe the séance truly opened a door — and something came through.'],
    motive: 'Ambrose refused to sell you the grimoire and laughed in your face.',
    rounds: [
      { clues: ['According to the Ravenmoor grimoire, the dead return on the anniversary of their death to point at those who wronged them.'], instructions: 'Lecture the room on the occult. Make it as creepy as you can.' },
      { clues: ['Your books call wolfsbane "the Queen of Poisons" — a murderer\'s favourite, because the symptoms look like heart failure. Any doctor could wave it away.'], instructions: 'Share the lore, but keep the stolen grimoire hidden.' },
      { clues: ['{ashgrove} wore gloves all evening — but took them off just before the séance began, and put them back on the moment the candles were relit.'], instructions: 'Admit the theft if accused, then share your observation about the gloves.' },
    ],
  },
];

// Extra characters for parties larger than 12 also join every round's accusation circle.
const MOURNERS = [
  { name: 'Mortimer Gale', role: 'The Distant Cousin', publicBlurb: 'A twitchy cousin who arrived uninvited, hoping to be remembered in the will.', motive: 'You hoped Ambrose would leave you something — anything.', secrets: ['You are penniless and have been sleeping in the stables.'],
    rounds: [{ clues: ['You heard Ambrose shout at someone in the study this afternoon: "I know what you did to her!"'], instructions: 'Tell everyone about the shouting — but you didn\'t see who it was.' }, { clues: ['The study desk had a medical journal open to a page on poisons, with "S.A." written in the margin.'], instructions: 'Share what you saw on the desk.' }, { clues: ['You admit you snooped through everyone\'s coats. The doctor\'s bag contained an empty vial with a green residue.'], instructions: 'Confess your snooping and describe the vial.' }] },
  { name: 'Ada Blight', role: 'The Governess', publicBlurb: 'Governess to a household with no children left. Prim, watchful, unsettlingly still.', motive: 'Ambrose was about to dismiss you now that there are no children to teach.', secrets: ['You were once tried for poisoning — and acquitted.'],
    rounds: [{ clues: ['You noticed the doctor did not drink his brandy before the séance. He only pretended.'], instructions: 'Mention the untouched glass.' }, { clues: ['Eleanor once told you she was afraid "of the man who keeps me well."'], instructions: 'Share Eleanor\'s words.' }, { clues: ['Your own past makes you an easy suspect. Point out you were nowhere near Ambrose.'], instructions: 'Defend yourself fiercely.' }] },
  { name: 'Jasper Cole', role: 'The Gardener', publicBlurb: 'The groundskeeper. Dirt under his nails, a lantern always in his hand.', motive: 'Ambrose blamed you for Eleanor\'s roses dying and docked your wages.', secrets: ['You have been poaching deer on the estate.'],
    rounds: [{ clues: ['Someone cut the monkshood in the conservatory tonight. The cut was clean and precise — made with a very sharp, small blade. Like a scalpel.'], instructions: 'Describe the cut stems.' }, { clues: ['You saw a man in a dark tweed coat leaving the conservatory around eleven.'], instructions: 'Describe the man in tweed.' }, { clues: ['You found a muddy pair of gloves stuffed in a flowerpot.'], instructions: 'Produce the "gloves" (any pair will do) and ask whose they are.' }] },
  { name: 'Lenore Ash', role: 'The Mysterious Stranger', publicBlurb: 'A veiled woman no one remembers inviting. She knows everyone\'s name.', motive: 'No one knows. That is what makes you frightening.', secrets: ['You are Eleanor\'s estranged sister, here under a false name.'],
    rounds: [{ clues: ['You came because Eleanor wrote to you a year ago: "I am being poisoned and no one believes me."'], instructions: 'Stay mysterious. Hint that you knew Eleanor.' }, { clues: ['Eleanor\'s letter mentioned "the doctor\'s tonic" twice.'], instructions: 'Reveal who you really are.' }, { clues: ['You will not rest until Eleanor\'s killer is named.'], instructions: 'Urge the room to look at whoever treated Eleanor.' }] },
];

/**
 * Build the sample story for a guest list.
 * guests: [{name, desc}]
 */
export function buildSampleStory(guests) {
  const n = Math.max(guests.length, 3);
  const chosen = CHARS.slice(0, Math.min(n, CHARS.length)).map(c => JSON.parse(JSON.stringify(c)));
  for (let i = CHARS.length; i < n; i++) {
    const m = MOURNERS[(i - CHARS.length) % MOURNERS.length];
    const cycle = Math.floor((i - CHARS.length) / MOURNERS.length);
    chosen.push({
      id: `mourner${i - CHARS.length + 1}`, name: m.name + (cycle ? ` ${['', 'II', 'III', 'IV', 'V'][cycle] || cycle + 1}` : ''), role: m.role,
      publicBlurb: m.publicBlurb, backstory: 'You are one of the mourners gathered at Ravenmoor tonight. You knew Lady Eleanor, and you have your own reasons for being here.',
      secrets: m.secrets, motive: m.motive, rounds: JSON.parse(JSON.stringify(m.rounds)),
    });
  }
  // Pre-resolve references to characters NOT present tonight into plain names.
  const present = new Set(chosen.map(c => c.id));
  const plain = Object.fromEntries(CHARS.map(c => [c.id, c.name]));
  const fixRefs = t => String(t).replace(/\{([a-z0-9]+)\}/g, (m, k) => (present.has(k) || !(k in plain) ? m : plain[k]));
  for (const c of chosen) {
    c.publicBlurb = fixRefs(c.publicBlurb); c.backstory = fixRefs(c.backstory); c.motive = fixRefs(c.motive);
    c.secrets = c.secrets.map(fixRefs);
    for (const r of c.rounds) { r.clues = r.clues.map(fixRefs); r.instructions = fixRefs(r.instructions); }
  }
  // Randomly assign guests to characters (so the killer is a surprise to the guests).
  const order = shuffle(guests);
  chosen.forEach((c, i) => {
    const g = order[i];
    c.guest = g ? g.name : '';
    c.guestNote = g ? g.desc : '';
  });
  const story = JSON.parse(JSON.stringify(BASE));
  story.schemaVersion = 1;
  story.characters = chosen;
  preparePublicEvidence(story, 'manor');
  return story;
}

export const SAMPLE_INFO = { title: BASE.title, min: 3, ideal: '4–12', blurb: 'A gothic séance goes wrong on the anniversary of a young wife\'s death. 5 evolving evidence rounds + a reveal. Works for 3–12 guests (more get extra "mourner" characters).' };
