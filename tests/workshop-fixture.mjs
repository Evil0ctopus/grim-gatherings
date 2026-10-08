import { blankStory, REVIEW_ITEMS } from '../js/workshop-core.js';

export function readyDraft() {
  const story = blankStory({ count: 3, rounds: 5 });
  story.title = 'A test mystery';
  story.setting = 'A storm-bound inn';
  story.intro = 'Three guests gather to investigate a death at the inn.';
  story.hiddenThread = 'A ledger links the guests to a private bargain.';
  story.specialMechanics = ['The storm-bound ledger changes how the final clue is interpreted.'];
  story.coverageRepeatNote = 'The inn story has five chapters, but three players complete clue coverage in two rounds; chapters three to five need repeated reader-target pairs.';
  story.rounds.forEach((round, ri) => {
    round.narration = `The guests examine the evidence in chapter ${ri + 1}.`;
    round.publicText = `Evidence summary for chapter ${ri + 1}.`;
    round.hostNotes = 'Read the chapter aloud.';
    round.events = [`Event ${ri + 1}`];
  });
  story.characters.forEach(character => {
    character.role = 'Inn guest';
    character.relationship = 'A longtime associate of the victim';
    character.tieIn = 'Their ledger entry places them at the inn that night.';
    character.publicBlurb = `${character.name} came to the inn to settle an old account.`;
    character.rounds.forEach((round, ri) => {
      const clue = round.readAloud;
      clue.text = `A signed witness statement records {${clue.accuses}} entering the west hall before the bell. The matching brass key bears fresh scratches that contradict the claim that it stayed sealed in the desk. The witness identified the key by its numbered tag.`;
      clue.observation = `A witness statement places ${clue.accuses} in the west hall.`;
      clue.contradictingDetail = `Fresh scratches on the numbered brass key contradict the claim it stayed sealed in the desk (chapter ${ri + 1}).`;
    });
  });
  story.finale.narration = 'The guests make their final accusations.';
  story.solution.explanation = 'The ledger, key and witness statement identify the killer.';
  story.solution.revealNarration = 'The full account reveals how the ledger and key exposed the killer.';
  return {
    id: 'local-draft',
    story,
    locks: [{ term: 'Benjamin Barker', round: 5 }],
    review: Object.fromEntries(Object.keys(REVIEW_ITEMS).map(key => [key, true])),
    author: 'Test author',
    brief: { idea: 'A revenge mystery' },
  };
}
