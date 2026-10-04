import { assignAccusationCircles } from './accusations.js?v=accusation-circle-v1';

// Each row follows one suspect from initial suspicion to a connection and final context.
const ravenmoor = {
  crane: [
    '{crane} controlled the household service and knew where the brandy was kept. Missing silver threatened to expose the butler to dismissal.',
    'The stolen silver links {crane} to concealed dealings outside the manor. Familiarity with the drinks and a threatened livelihood make that theft more troubling after the tonic discovery.',
    '{crane} noticed Eleanor\'s tonic bottle and the glass evidence. The silver theft explains secrecy, but the clean decanter and poisoned rim require a hand at Ambrose\'s own glass, not merely access to household service.',
  ],
  ashgrove: [
    'The chair beside {ashgrove} scraped back during the blackout. Ambrose then choked and his lips turned blue: signs of wolfsbane, not an ordinary weak heart. Why did the physician call it heart failure?',
    'Eleanor\'s old tonic bottle bears the initials S.A. in {ashgrove}\'s handwriting. Soil from the cut monkshood leads toward the physician\'s chair. Was the same poison used twice?',
    'A reaching hand wore {ashgrove}\'s serpent-and-staff ring. Ambrose\'s glass rim carried wolfsbane, but the shared decanter was clean. The bottle, ring and soil connect the physician to both deaths.',
  ],
  constance: [
    '{constance} poured the brandy before the blackout and stands to inherit the manor. That gives both access to the drinks and a financial reason for suspicion.',
    '{constance} kept gambling debts hidden, and Ambrose refused to lend money at dinner. The promised inheritance would settle those debts; was the pouring more than hospitality?',
    '{constance} drank brandy from the same decanter and survived. The poison was on Ambrose\'s individual glass, not in the shared drink. The inheritance remains suspicious, but pouring alone is not proof.',
  ],
  vesper: [
    'A hidden pedal beneath {vesper}\'s skirts was pressed just before the candles died. The spiritualist controlled the darkness in which Ambrose was killed.',
    'A wire beneath the table links {vesper} to the supposed spirit knocks. Ambrose had threatened to expose the fraudulent medium: a reason to silence an employer.',
    'The script paid for by Ambrose ordered {vesper} to ask, "Who gave me the tonic?" The blackout was planned for a trap, not proof of a supernatural murder. The medium concealed fraud, but the script explains the performance.',
  ],
  grey: [
    '{grey} was summoned to a seance despite openly opposing it. Ambrose had threatened to report the priest\'s drinking to the bishop; a ruined reputation was at stake.',
    'Eleanor confided her fear of her medicine to {grey}, yet that warning never reached the household. Silence protected someone while her illness worsened.',
    '{grey} kept Eleanor\'s warning under the seal of confession. That explains the silence, not murder. The warning says her medicine, rather than fever, killed her: test the priest\'s account against the tonic evidence.',
  ],
  marsh: [
    '{marsh} managed the estate accounts, and Ambrose had demanded an audit. The solicitor had reason to dread what the books would reveal.',
    'Unexplained withdrawals point to {marsh} borrowing estate money. A sealed codicil was withheld after the death: was a legal adviser hiding more than an account?',
    'The codicil entrusted to {marsh} says, "If I die tonight, look to the man who signed my Eleanor\'s death certificate." The solicitor\'s theft explains fear of an audit, while the preserved document supplies another lead.',
  ],
  pell: [
    '{pell} grew monkshood in the conservatory. Its poison causes blue lips and a failing heart, the symptoms seen on Ambrose. The cook had access to the suspected poison.',
    'Ambrose planned to evict {pell} and destroy the garden. Cut monkshood stems make that dispute troubling: access and resentment now appear together.',
    'The tonic bottles washed in {pell}\'s kitchen smelled of wolfsbane a year ago. The garden explains the source, but not who put it on a single glass tonight. The cook\'s knowledge connects the two deaths.',
  ],
  finch: [
    '{finch} claimed to represent the Gazette, but the paper had dismissed the reporter. Ambrose could expose that deception and destroy the promised scoop.',
    '{finch} took a flash photograph at the instant of the blackout and kept it while it developed. A hidden record of the murder might protect a witness or expose one.',
    'The photograph kept by {finch} shows a hand and a gold snake-shaped ring near Ambrose\'s glass. It supplies physical evidence rather than the invented reporting that cost the journalist a job.',
  ],
  wren: [
    '{wren} had been using Eleanor\'s room and perfume despite Ambrose\'s objections. Dismissal after the gathering threatened the maid\'s last connection to Eleanor.',
    'The plants in the room tended by {wren} died after Eleanor poured tonic into their pots. The maid knew something was wrong with the medicine but had not exposed it.',
    'The diary page preserved by {wren} reads, "S. knows that I know. He watches me drink every night." Keeping the room intact saved evidence; secrecy is not itself proof that the maid administered poison.',
  ],
  ivy: [
    'Lipstick on Ambrose\'s collar links {ivy} to a concealed affair. He had ended it yesterday; the singer had both anger and private access.',
    '{ivy} removed love letters from Ambrose\'s coat after the body was found. That is interference with the scene, even if the purpose was to hide an affair.',
    'Beside the letters taken by {ivy} was Ambrose\'s note: "Watch S.A.\'s hands when the lights return." The pocket explains the singer\'s suspicious visit to the body and preserves Ambrose\'s warning.',
  ],
  vane: [
    '{vane} arrived carrying a revolver while owing Ambrose a fortune. The debt had been called in; an old comrade had a powerful financial motive.',
    '{vane} sat opposite Ambrose and noticed a sharp green smell during the blackout. That proximity invites questions about the captain\'s movements and the concealed weapon.',
    'Ambrose died of poisoning, not a gunshot. {vane}\'s weapon and debts are alarming but do not explain poison on the glass rim. The report of crushed plants should be compared with the monkshood.',
  ],
  blackwood: [
    '{blackwood} coveted the forbidden grimoire Ambrose refused to sell. The scholar arrived with a reason to resent the master of the house.',
    'The missing grimoire was hidden in {blackwood}\'s coat. Its discussion of wolfsbane as a poison resembling heart failure shows the scholar knew the method.',
    '{blackwood} concealed a book theft, not a proven poisoning. The scholar\'s observation that gloves were removed before the blackout and replaced afterward can be checked against the ring and glass evidence.',
  ],
};

const mercy = {
  clerk: [
    '{clerk} entered the records room after Ward. The witness saw nobody else enter before the minister arrived. Access places the clerk at the center of the first questions.',
    'A scorched deed records payments to a private account linked to {clerk}. The forged confession uses the language of court forms: fear may be covering a land fraud.',
    'Ward\'s notebook names {clerk} as the collector of unapproved deed payments. The missing star on the seal and a fragment of the clerk\'s broken chain join motive, forgery and presence in the records room.',
  ],
  midwife: [
    '{midwife} sent Ward an angry letter after the hearings endangered a family member. The dispute gives a reason for resentment, even though witchcraft rumors prove nothing.',
    '{midwife} concealed a sister\'s whereabouts from the council. That deliberate deception invites questions about what else the midwife knew on the night Ward died.',
    'The letter and concealment by {midwife} sought protection for a sister, not a land payment. The midwife\'s report of an intact brass chain before the meeting gives a timeline for the fragment found later.',
  ],
  minister: [
    '{minister} opened the records-room door and discovered Ward. Access to the room and a history of hidden testimony make that discovery worth questioning.',
    '{minister} held back testimony that could have challenged the hearings. A reputation built on those hearings gave the minister a reason to fear Ward\'s investigation.',
    'The draft preserved by {minister} repeats the false confession\'s wording and carries the clerk\'s handwriting. Withholding testimony was wrong, but preserving this page helps expose an earthly forgery.',
  ],
  witness: [
    '{witness} gave testimony used against an accused family. Ward\'s packet held a retraction, making the witness vulnerable to exposure.',
    '{witness} came to correct the testimony rather than repeat it. A missing retraction might still protect a frightened witness from the consequences of an earlier lie.',
    '{witness} saw the clerk leave holding a packet. That account explains the missing retraction without proving the witness stole it. Compare the sighting with the notebook and physical evidence.',
  ],
  miller: [
    '{miller} argued with Ward about grain before he entered the records room. Dishonest grain accounts made official scrutiny unwelcome.',
    'A receipt shows {miller} paid the same records fee twice. A concealed payment may connect a village quarrel to the papers Ward was investigating.',
    'The mill named in the private payment column belongs to {miller}. The entry was not a lawful council charge; it supports the fee scheme rather than establishing who entered the room to kill Ward.',
  ],
  seamstress: [
    '{seamstress} supplied the sort of black ribbon pinned to the warning. An ordinary purchase could have equipped the person staging a supernatural threat.',
    '{seamstress} hid a traveling cloak for an accused friend. Secret preparations to leave town could look like planning an escape after the murder.',
    'The ribbon sold by {seamstress} went to three households, not one. The clerk\'s request for a chain-clasp repair after the meeting began adds a checkable connection to the broken chain.',
  ],
  innkeeper: [
    '{innkeeper} owed Ward money. A creditor\'s death might bring relief to an inn on the brink of failure.',
    '{innkeeper} lied to the council about sheltering a traveler. That secrecy made the inn a possible refuge for someone avoiding investigation.',
    'Ward paid for the traveler\'s food at {innkeeper}\'s inn. The concealment protected a guest; the account used to pay the clerk\'s inn bill matches the burnt deed and should be followed instead.',
  ],
  schoolmaster: [
    '{schoolmaster} helped write the retraction in Ward\'s missing packet. Someone who knew its contents could have wanted it removed.',
    '{schoolmaster} concealed a threat against the school. Fear of retaliation gave a reason to keep testimony and correspondence out of public view.',
    'Ward annotated the retraction prepared with {schoolmaster}: "Ask Pike about the payments." Protecting pupils explains the silence, while the annotation corroborates the notebook\'s financial lead.',
  ],
};

const farm = {
  surveyor: [
    '{surveyor} left the workshop after Otto entered. A brass button is missing from the survey coat, and the map beside the body was torn.',
    'Boundary sketches in the attic match the work of {surveyor}. The concealed stair leads from the measuring room, despite the surveyor\'s claim that the attic was inaccessible.',
    'The ledger names {surveyor} as the paid author of the altered north boundary. Otto wrote that he would confront Adler. The recovered brass button matches the survey coat, linking the payment to the workshop encounter.',
  ],
  heir: [
    '{heir} would inherit Blackthorn Farm and had secretly contacted another buyer. A disputed sale could give the heir a reason to hurry Otto out of the way.',
    '{heir} hid the original boundary plan while the offered map diverted the valuable spring. Concealing the very document needed to check the sale deserves an explanation.',
    'The plan saved by {heir} keeps the spring inside the farm. Otto\'s note on it called for confronting the surveyor that evening. The concealed map protects a truthful inheritance rather than the false sale.',
  ],
  housekeeper: [
    '{housekeeper} found Otto with the mechanic and had threatened to leave over unpaid wages. Being close to the discovery does not resolve the wage dispute.',
    '{housekeeper} secretly took food, allowing the household to blame an intruder. That deception helped the supposed haunting seem real.',
    '{housekeeper} remained at the kitchen window until the mechanic arrived and reported no outsider crossing the courtyard. Food theft explains some missing supplies, but the survey coat sighting should be tested against the button.',
  ],
  mechanic: [
    '{mechanic} raised the alarm and knew the workshop doors. Otto had discovered stolen spare parts, putting the mechanic\'s job at risk.',
    '{mechanic} repaired the concealed attic stair without Otto\'s approval. That repair created access for the person behind the staged footsteps.',
    'The stair repair by {mechanic} was requested by the surveyor. Otto carried an intact map into the workshop; the later tear and recovered coat button point to a confrontation, not proof that the parts thief caused it.',
  ],
  neighbor: [
    '{neighbor} expected Otto to threaten a lawsuit over a fence. The long boundary quarrel made the gathering more than a friendly visit.',
    '{neighbor} moved a fence post to reach water. A new survey could expose that interference and turn a quiet dispute into a costly one.',
    'The post moved by {neighbor} concerns pasture, not the north spring. The older footprints near the woods predate tonight\'s snow: the fence dispute does not establish a new intruder.',
  ],
  teacher: [
    '{teacher} summarized the sale contract for Otto and missed an important clause. Otto had begun questioning the advice he received.',
    '{teacher} concealed that mistake and borrowed money from the heir. Debts and damaged trust gave the teacher a reason to fear the sale discussion.',
    'The clause overlooked by {teacher} follows the amended map. The buyer\'s separate fee to the surveyor is recorded in correspondence; carelessness is suspicious but does not explain that payment or the workshop button.',
  ],
  postmaster: [
    '{postmaster} brought a delayed parcel and stayed for supper. The delivery gave access to the farm before the death.',
    '{postmaster} opened and badly resealed a letter warning Otto about the buyer. Withholding that warning could have helped the fraudulent sale proceed.',
    'The parcel delivered by {postmaster} contained map paper. The amended-map invoice was addressed to the surveyor. Mail interference explains secrecy, while the invoice gives a specific authorship lead.',
  ],
  buyeragent: [
    '{buyeragent} stood to earn a commission from a sale Otto intended to delay. The buyer\'s representative had reason to resent his refusal.',
    'The employer of {buyeragent} would gain control of the spring under the amended map. That direct commercial benefit makes the agent\'s pressure for a sale troubling.',
    'The letter withheld by {buyeragent} names the surveyor as author of the amendment. The commission explains ambition, but the letter must be compared with the separate survey fee and physical evidence.',
  ],
  musician: [
    '{musician} arrived as an unfamiliar outsider using a borrowed surname. A strange cap by the door made the newest guest an easy suspect.',
    '{musician} changed names to escape a debt. Hiding that history makes the account of being stranded worth checking.',
    'The cap associated with suspicion of {musician} was already in the farm\'s spare-clothes basket. The musician recalls the surveyor removing it earlier; a false name alone does not explain the altered map.',
  ],
};

const briar = {
  solicitor: [
    '{solicitor} signed for the new will before the meeting and was seen leaving the study before its bell stopped. That conflicts with the claim of never entering.',
    'The duplicate will removes {solicitor} as trustee. Cecily\'s letter demands repayment before she goes to the bank: the adviser, not the heirs, loses most.',
    'The carbon account copy records transfers to {solicitor}\'s private practice. The appointment note and corridor sighting independently contradict the alibi. Destroying originals did not erase copies.',
  ],
  daughter: [
    '{daughter} argued loudly with Cecily and wanted control of the inheritance. A bitter family quarrel makes the daughter an obvious first suspect.',
    '{daughter} hid Cecily\'s letter about the accounts. Withholding a warning after the argument invites questions about whether money mattered more than reconciliation.',
    'The new will still provides for {daughter}. The letter and appointment note she preserved expose the adviser\'s repayment problem; resentment alone does not explain the targeted account page.',
  ],
  housekeeper: [
    '{housekeeper} was near the study corridor before the alarm. Cecily had noticed a household shortfall that threatened the housekeeper\'s job.',
    '{housekeeper} delayed reporting a corridor sighting out of fear of an investigation. Missing household money makes that delay suspicious.',
    'The money taken by {housekeeper} was a small household sum, separate from the trust transfers. Her report of no other entry between the meeting and discovery can be compared with the receipt and appointment.',
  ],
  secretary: [
    '{secretary} discovered Cecily and handled the new will and account copies. Access to the documents made their disappearance a question for the secretary.',
    '{secretary} planned to leave the household without telling the family. The duplicate will in the correspondence tray shows important papers were being retained.',
    'Cecily instructed {secretary} to keep copies. The carbon page survives the torn original and names the private practice receiving trust money. Preparing to leave does not explain those transfers.',
  ],
  nephew: [
    '{nephew} had large debts and claimed the new will would ruin him. Financial desperation gave the nephew a plausible reason to fear the announcement.',
    '{nephew} never read the will and borrowed money under a false promise. The story of disinheritance was a guess presented as fact.',
    'The duplicate will provides enough for {nephew} to address the debts. Pell encouraged the complaints before supper; the nephew\'s dishonesty does not make the false inheritance rumor true.',
  ],
  companion: [
    '{companion} expected a pension from Cecily and kept that promise secret. A private financial arrangement could look like an incentive for her death.',
    '{companion} concealed a letter about leaving after the announcement. A promised pension and departure plan together invite suspicion.',
    'The pension sought by {companion} was modest, not the missing trust fortune. Her observation that Pell asked for originals rather than copies connects the missing papers to a different financial interest.',
  ],
  doctor: [
    '{doctor} faced a professional complaint from Cecily over a careless certificate. The household physician had reason to fear her demands for accountability.',
    'Cecily intended to replace {doctor}. A threatened career makes the doctor\'s relationship with an apparently healthy victim worth examining.',
    'The complaint against {doctor} remained on the desk. The will and account page were specifically removed, suggesting the killer feared the financial documents rather than that medical complaint.',
  ],
  foreman: [
    '{foreman} argued over the trust and faced an audit of a repair allowance. The foreman had reason to resent Cecily\'s control.',
    '{foreman} diverted a repair allowance into emergency wages. An investigation could expose that unauthorized use even if workers benefited.',
    'The allowance diverted by {foreman} was much smaller than the trust withdrawals. The carbon page explains where the larger sums went; the proposed charitable trust would actually have helped injured workers.',
  ],
  journalist: [
    '{journalist} promised discretion while planning a scandal about the trust. A dishonest invitation gave the reporter access to a vulnerable household.',
    '{journalist} secretly pursued a bank inquiry into trustee transactions. Concealing a source made the reporter\'s knowledge of the accounts troubling.',
    'The notes kept by {journalist} record Pell insisting on the old will before the announcement. That supports a question about the missing new document, while a planned expose is not itself evidence of murder.',
  ],
  cousin: [
    '{cousin} asked Cecily for money and was refused. Years of distance had not removed the visiting cousin\'s financial need.',
    '{cousin} sold a family keepsake and let someone else take the blame. A prior deception about money makes the claim of reconciliation suspect.',
    '{cousin} saw the duplicate will in the secretary\'s tray before the alarm. The keepsake theft explains shame, while the sighting establishes that the duplicate was not fabricated after Cecily died.',
  ],
};

export function preparePublicEvidence(story, kind) {
  const evidence = { ...{ manor: ravenmoor, witch: mercy, farm, victorian: briar }[kind] };
  for (const c of story.characters) {
    // Extra Ravenmoor mourners repeat supporting roles, but receive individually named evidence.
    if (c.id.startsWith('mourner')) {
      const rows = [
        ['arrived hoping for a share of the will', 'searched the guests\' coats without permission', 'found an empty vial while snooping; searching coats explains the access, not who poisoned the glass'],
        ['faced dismissal from a household with no children', 'concealed an earlier poisoning trial', 'was acquitted in that earlier trial; a past accusation is not proof of this murder'],
        ['had wages docked over Eleanor\'s roses', 'kept illegal poaching hidden from Ambrose', 'found muddy gloves in a flowerpot; garden access alone does not identify the hand at the glass'],
        ['arrived under a false name', 'hid a family connection to Eleanor', 'is Eleanor\'s sister and preserved her warning letter; the disguise explains secrecy rather than a wish to silence Ambrose'],
      ];
      const row = rows[(Number(c.id.slice(7)) - 1) % rows.length];
      evidence[c.id] = row.map((event, ri) => `{${c.id}} ${event}. ${['That gives a reason to question this guest tonight.', 'The concealed history adds to the suspicion as the tonic evidence emerges.', 'Compare this explanation with the ring, bottle and poisoned rim before voting.'][ri]}`);
    }
    for (const r of c.rounds) delete r.instructions;
  }
  assignAccusationCircles(story, evidence);
}
