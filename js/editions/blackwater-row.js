// Melissa's authored four-player mystery; its clue circle stays fixed across all five rounds.
export default {
  4: {
    schemaVersion: 2,
    discloseKiller: false,
    edition: { family: 'blackwater-row', id: 'blackwater-row-4', playerCount: 4, revision: 1 },
    title: 'The Barber of Blackwater Row',
    atmosphere: 'victorian',
    setting: 'Blackwater Row, a riverside town of workshops, narrow lanes and gaslit streets in the late nineteenth century.',
    intro: 'Blackwater Row wakes to bread ovens and sleeps beneath Tobias Wick\'s streetlamps. Elias Brim delivers bread to almost every doorstep; Ronan Pike hears the town\'s troubles over his tavern counter; Harper Wren keeps the school running. Four neighbors have been called to help the town investigator if trouble comes: {xander}, the woodworker; {marla}, the baker\'s assistant; {jasper}, the tavern musician; and {lydia}, the schoolteacher. Each will read an account about another neighbor. Listen carefully, compare the accounts and vote on the evidence, not on invented histories. Nobody needs to act or keep a secret.',
    victim: {
      name: 'Elias Brim',
      description: 'The town baker, whose dependable delivery rounds and detailed logs made him a trusted observer of everyday life.',
    },
    rounds: [
      {
        title: 'Round 1 - The Baker\'s Murder',
        narration: 'At dawn, Elias Brim is found behind his bakery with his throat slashed. The investigator describes one clean, precise cut; the death happened off-screen. Elias delivered bread to nearly every home and business and kept unusually careful delivery logs. He knew when shutters opened, who answered a door and which regular customers had stopped appearing. Flour footprints cross the back yard, then disappear on the wet cobbles. They do not establish who wore the shoes. A page has been torn from an older delivery log, leaving only its date and the edge of a receipt number. It is not yet possible to tell what the missing entry recorded. The investigator preserves the log rather than treating the footprints as a verdict. {xander} leads the comparison of bakery access; {marla} leads the comparison of the back-yard sighting; {jasper} leads the comparison of the morning argument; {lydia} leads the comparison of the interrupted workshop visits. Read the four accounts, then discuss what each observation proves and what it merely suggests.',
        publicText: 'Elias Brim, baker: throat slashed with a clean, precise cut. Detective evidence: flour footprints ending at wet cobbles; a torn delivery-log page. Access and arguments are leads, not proof.',
        hostNotes: 'Read all narration, then invite Xander, Marla, Jasper and Lydia to read in that order. Discuss before opening voting. Do not supply a culprit, a missing name or an explanation for the old receipt.',
      },
      {
        title: 'Round 2 - The Barkeep\'s Murder',
        narration: 'The following morning, Ronan Pike is found slumped over his tavern counter with his throat slashed. The clean cut matches the one described at Elias\'s bakery. Ronan remembered debts, listened to private conversations and stayed open after other businesses shut. A mug beside him has been wiped down and bears no usable fingerprints; that does not tell the investigator who cleaned it. Beneath it lies a scrap listing Elias, Ronan, Harper and Tobias beside the same old receipt number found at the edge of the torn bakery page. The scrap gives no purpose for the list. The investigator now has a link between the records, not just a similar wound, and keeps the original scrap for comparison. {xander} leads the comparison of the debt dispute; {marla} leads the comparison of closing time; {jasper} leads the comparison of Ronan\'s notes; {lydia} leads the comparison of the sharpening equipment. Read the accounts before deciding whether opportunity, record-keeping or unusual tools explain both deaths.',
        publicText: 'Ronan Pike, barkeep: throat slashed with the same clean cut. Detective evidence: a wiped mug with no usable fingerprints; a scrap listing four townspeople and the bakery log\'s old receipt number.',
        hostNotes: 'The matching receipt is a documentary link, not yet an explanation. Read the clues in the same order. The fine sharpening stones are a breadcrumb; do not identify a former trade yet.',
      },
      {
        title: 'Round 3 - The Schoolteacher\'s Murder',
        narration: 'Before sunrise, Harper Wren is found in her classroom with her throat slashed, the same clean cut again. As senior teacher she taught almost every child in Blackwater Row, stayed late preparing lessons and kept strict records of family circumstances. Chalk dust is smeared across the desk; it could come from ordinary school work and does not identify a visitor. One page is missing from an older student-record book. Its remaining index entry cites the receipt number already found at the bakery and tavern. A margin note reads, "Copy kept with the original order"; it does not say where that order is held. The investigator reads the note aloud so everyone has the same information. Three scenes now contain disturbed records linked by one number. {xander} leads the comparison of Harper\'s delivery schedule; {marla} leads the comparison of the fundraiser; {jasper} leads the comparison of the teachers\' meetings; {lydia} leads the comparison of a remark about an earlier trade. Separate a reason to visit Harper from evidence of killing her.',
        publicText: 'Harper Wren, senior teacher: throat slashed with the same clean cut. Detective evidence: smeared chalk dust; a missing student-record page whose index links it to the old receipt. A copy was kept with an original order.',
        hostNotes: 'Harper is the victim, not Lydia, who remains a playable schoolteacher. Keep the old order\'s owner and the former trade unnamed. Invite all four read-aloud accounts before voting.',
      },
      {
        title: 'Round 4 - The Lamplighter\'s Murder',
        narration: 'Tobias Wick is found beside an extinguished streetlamp with his throat slashed in the same precise manner. His nightly route let him see who moved after dark; his notes recorded suspicious activity. Lamp oil has spilled in a perfect circle around the lamp base, but its shape cannot identify the killer. A page is torn from his old route notebook. The surviving index carries the same receipt number and the instruction, "Retain duplicate with original order." Before the next vote, the investigator revisits earlier suspicions using the records already collected. The bakery delivery sheet shows Marla\'s late visit was a scheduled closing chore, not an unexplained break-in. Ronan\'s service tally places Jasper\'s final drink before Ronan\'s later private appointments; being the last customer served is not the same as being the last visitor. Harper\'s lesson diary describes Lydia\'s weekly meetings as preparations for school work. None of these records proves an alibi for every death, but each corrects an earlier assumption. The missing pages remain unexplained, and the matching cuts still matter. {xander} leads the comparison of the market argument; {marla} leads the comparison of Tobias\'s route; {jasper} leads the comparison of warnings about notes; {lydia} leads the comparison of a newly seen blade. Read all four accounts and compare the blade with the sharpening stones and earlier-trade remark.',
        publicText: 'Tobias Wick, lamplighter: throat slashed with the same precise cut. Detective evidence: a circle of spilled lamp oil; a torn night-route page tied to the old receipt. Earlier records explain closing chores, later tavern appointments and school meetings, without proving complete alibis.',
        hostNotes: 'Revisit the Round 1-3 notebook, not invented alibis. A straight razor is now named in Lydia\'s clue. Its ownership is evidence to assess, not an automatic guilty badge. Keep the old case and its connection unrevealed.',
      },
      {
        title: 'Round 5 - The Mayor\'s Murder',
        narration: 'Mayor Aldric Thorne is found in his office chair with his throat slashed, the same perfect cut. A polished straight razor lies on his desk. The Mayor controlled licenses, property rights and legal disputes, often through quiet deals. Beside the razor lies a single old court document, signed by Thorne, ordering the imprisonment of BENJAMIN BARKER. This is the first time that name enters the investigation. The document bears the receipt number traced through all four earlier scenes. The investigator opens the attached duplicate records promised by Harper\'s index and Tobias\'s notebook and reads their contents to everyone. Elias signed a false delivery entry placing Barker at a theft; Ronan signed a fabricated account of a confession; Harper altered a household record to support the charge; Tobias supplied a false night-route sighting. A retained letter from Thorne orders these changes, admits that he wanted Barker\'s wife and describes using imprisonment to separate them. The household record shows she was taken into Thorne\'s household under coercion, not by free choice. Barker\'s old licensed occupation is barber. The file includes his likeness, recognizable as the man now called Xander Hale, and the same workshop address. The razor on the desk has the chipped ivory handle described in the licensed barber\'s tool inventory. The court file gives meaning to the missing pages, the repeated cuts and the increasingly specific blade evidence, but the group must still make its own accusation. {xander} leads the comparison of Marla\'s old observation; {marla} leads the comparison of Jasper\'s rumors; {jasper} leads the comparison of Lydia\'s document sighting; {lydia} leads the comparison of the Mayor\'s reaction to the name. Read all four final accounts before voting.',
        publicText: 'Mayor Aldric Thorne: throat slashed; a polished straight razor on his desk. Detective evidence: his signed imprisonment order names Benjamin Barker. Attached duplicate records expose the four victims\' false testimony and Thorne\'s coercion. A barber\'s license, likeness, address and tool inventory connect the old file to the present investigation.',
        hostNotes: 'Release the name and Mayor connection only now. Read every attached record aloud; the solution must not introduce evidence the group never heard. Let all four players read, then open the final vote. Keep the solution and monologue for Reveal the killer.',
      },
    ],
    characters: [
      {
        id: 'xander', name: 'Xander Hale', role: 'Woodworker', optional: false, guest: '', guestNote: '',
        publicBlurb: 'A quiet craftsperson who repairs furniture and makes wooden fittings in a workshop off the market lane. Known for patient, exact work.',
        rounds: [
          { readAloud: { accuses: 'marla', text: '{marla} was the last person seen inside Elias\'s bakery before he locked up. The sighting places her at the closing routine, but does not establish when she left or who later reached the back yard.' } },
          { readAloud: { accuses: 'marla', text: '{marla} argued with Ronan last night about a debt he claimed she never paid. The dispute was audible from the street; the account records an angry disagreement, not a witnessed attack.' } },
          { readAloud: { accuses: 'marla', text: '{marla} delivered bread to Harper every morning and knew her schedule. Regular access explains familiarity with the school doors, but it also means she could predict when Harper would be alone.' } },
          { readAloud: { accuses: 'marla', text: '{marla} saw Tobias arguing with someone near the market last night. Her account identifies Tobias but not the other person; knowing where the argument happened does not establish who followed him.' } },
          { readAloud: { accuses: 'marla', text: '{marla} saw the Mayor visiting the home now occupied by the woodworker years ago, before its present resident used the name Xander Hale. She kept that observation quiet until the old court file was opened; seeing the visit is not evidence that she helped arrange the imprisonment.' } },
        ],
      },
      {
        id: 'marla', name: 'Marla Quinn', role: 'Baker\'s assistant', optional: false, guest: '', guestNote: '',
        publicBlurb: 'Elias Brim\'s assistant, responsible for bread deliveries and the evening cleanup. A familiar face at doorsteps across Blackwater Row.',
        rounds: [
          { readAloud: { accuses: 'jasper', text: '{jasper} was hanging around behind the bakery after closing; Elias mentioned it earlier. The account places him near the back entrance, but gives neither a reason for waiting nor a witness to the murder.' } },
          { readAloud: { accuses: 'jasper', text: '{jasper} was the last person Ronan served, and Ronan locked the door after he left. That describes the end of public service, not whether Ronan admitted someone later for a private conversation.' } },
          { readAloud: { accuses: 'jasper', text: '{jasper} played at Harper\'s school fundraiser the night before she died. He had been inside the school and could have noticed its closing routine; performing there does not prove he returned before sunrise.' } },
          { readAloud: { accuses: 'jasper', text: '{jasper} followed Tobias during one of his night rounds and said the lamplighter was acting strange. He knew part of the route, but his description does not establish where Tobias went after they separated.' } },
          { readAloud: { accuses: 'jasper', text: '{jasper} heard rumors that the woodworker had another name before arriving here. He could not substantiate those rumors before the court file appeared. His silence made him look informed, but a rumor is not proof that he knew about the false testimony or committed a murder.' } },
        ],
      },
      {
        id: 'jasper', name: 'Jasper Crowe', role: 'Tavern musician', optional: false, guest: '', guestNote: '',
        publicBlurb: 'A musician at Ronan Pike\'s tavern who also plays for town events. Often out late carrying his instrument between jobs.',
        rounds: [
          { readAloud: { accuses: 'lydia', text: '{lydia} had a tense conversation with Elias that morning, and he looked shaken afterward. The observer heard no complete explanation, so the conversation suggests friction without establishing a threat.' } },
          { readAloud: { accuses: 'lydia', text: '{lydia} told Ronan he was keeping "dangerous notes" on people. The warning shows she objected to his records, but it does not say which notes she meant or show that she ever took them.' } },
          { readAloud: { accuses: 'lydia', text: '{lydia} was Harper\'s closest friend and met with her privately almost every week. She knew Harper\'s habits and had regular access; friendship does not explain the missing page or establish a murder.' } },
          { readAloud: { accuses: 'lydia', text: '{lydia} warned Tobias to stop keeping notes on people. This resembles her warning to Ronan and invites questions about the records, but no witness saw her remove a page or use a blade.' } },
          { readAloud: { accuses: 'lydia', text: '{lydia} once saw the Mayor holding a document with an unfamiliar name on it; he hid it quickly. She could not read the full order then. Her observation supports his wish to conceal a record, but does not make her a signatory to the false statements exposed today.' } },
        ],
      },
      {
        id: 'lydia', name: 'Lydia Vance', role: 'Schoolteacher', optional: false, guest: '', guestNote: '',
        publicBlurb: 'A teacher working alongside senior teacher Harper Wren. Attentive to the town\'s families and protective of their privacy.',
        rounds: [
          { readAloud: { accuses: 'xander', text: '{xander} reacted strangely when Elias stopped visiting his workshop last week. His sudden silence was noticeable, but the observer did not hear what the earlier visits had been about.' } },
          { readAloud: { accuses: 'xander', text: 'Ronan said {xander} owned sharpening stones "too fine for woodworking." They would suit a very narrow, carefully honed edge; the remark raises a question about his tools without identifying a murder weapon.' } },
          { readAloud: { accuses: 'xander', text: 'Harper once said {xander} "used to work with blades in another trade." She did not name that trade. Combined with the fine sharpening stones, her remark suggests skills beyond those visible in his workshop.' } },
          { readAloud: { accuses: 'xander', text: '{xander} was seen holding a straight razor yesterday, with a chipped ivory handle. It was not a woodworking tool. That specific blade makes the earlier sharpening stones and remark about another trade worth reconsidering alongside the repeated precise cuts.' } },
          { readAloud: { accuses: 'xander', text: 'The Mayor panicked on finding the paper bearing {xander}\'s real name: Benjamin Barker. The court file\'s likeness and workshop address identify the same man; its barber\'s inventory describes the chipped ivory razor seen yesterday and now on the desk. His former trade explains the stones, blade skills and consistent cuts, while the duplicate records connect every victim to the wrong done to him.' } },
        ],
      },
    ],
    finale: {
      narration: 'Five deaths share one precise cut. Four disturbed records share the number on the final court file. Decide which of the four neighbors best fits the blade evidence, the old identity and the connection between the victims. A reason for revenge can explain a crime without excusing it. Make your final accusation before the investigator announces the solution.',
      votePrompt: 'Who committed the five murders in Blackwater Row?',
    },
    solution: {
      killerId: 'xander',
      explanation: 'Xander Hale is Benjamin Barker, formerly Blackwater Row\'s trusted barber, and he committed all five murders. Mayor Aldric Thorne wanted Barker\'s wife. As the letter and court file read in Round 5 establish, Thorne framed Barker, ordered his imprisonment and forced his wife into his household. Elias\'s false delivery entry, Ronan\'s invented confession, Harper\'s altered household record and Tobias\'s false night sighting helped destroy Barker\'s married life. After his release, Barker abandoned his name and returned as the woodworker Xander Hale. The early clues did not require anyone to know this identity: the fine stones, earlier blade trade and chipped ivory straight razor progressively established his means. The Round 5 likeness, address and barber\'s inventory joined those clues to the old file. The repeated cuts and matching receipt number linked the crimes; the retained duplicates exposed why these particular victims were targeted. Marla\'s access, Jasper\'s late movements and Lydia\'s warnings made reasonable investigative leads, but they did not account for that complete chain. Barker killed the four accomplices before reaching his final target, the Mayor. This was deliberate revenge, not justice; the Mayor\'s wrongdoing does not absolve the murderer.',
      revealNarration: 'The investigator closes the court file. "The killer is {xander}. His former name was Benjamin Barker, and his former trade was barber. The town knew his workmanship before it knew what had been taken from him. The four earlier victims helped Thorne imprison him; Thorne was the final target. Those missing pages were pieces of one ruined life."\n\nThe host may read Barker\'s final words: "Once this town knew me as Benjamin Barker. I had a trade, a wife and a home. Thorne wanted what was not his, and four respectable voices made his lie sound like law. When I returned, I called myself Xander Hale and worked in wood. I thought a new name could bury the old one. Instead I carried it through every door. I chose revenge, and I killed them. It did not restore my wife\'s freedom or the years we lost. Nothing I did made the lie true, and nothing they did makes these murders right."\n\nThe names on the records can finally be spoken openly. The investigation is over; Blackwater Row must now reckon with both the original injustice and the five deaths that followed.',
    },
  },
};
