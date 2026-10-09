import { selectLockdownDraft, reviewLockdownDraft } from './lockdown-draft-catalog.mjs';

const status = document.getElementById('selection-status');
const content = document.getElementById('draft-content');
const count = document.getElementById('player-count');
const element = (tag, text) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  return node;
};
const paragraph = text => element('p', text);
let catalog;

function render() {
  content.replaceChildren();
  try {
    const edition = selectLockdownDraft(catalog, Number(count.value));
    const names = Object.fromEntries(edition.characters.map(character => [character.id, character.name]));
    status.textContent = `${edition.count}-player edition selected - seven rounds - unpublished draft`;
    const warnings = element('details');
    warnings.open = true;
    warnings.append(element('summary', 'Publication blockers'));
    const issues = element('ul');
    reviewLockdownDraft(edition).forEach(issue => issues.append(element('li', issue)));
    warnings.append(issues);
    content.append(warnings, element('h2', 'Characters'));
    for (const character of edition.characters) {
      const card = element('section');
      card.className = 'card draft-character';
      card.append(element('h3', character.name), paragraph(character.card));
      content.append(card);
    }
    content.append(element('h2', 'Victim'), paragraph(edition.victim));
    edition.rounds.forEach((round, ri) => {
      const chapter = element('details');
      chapter.className = 'draft-round';
      chapter.append(element('summary', `Round ${ri + 1}: ${round.title}`), paragraph(round.narration));
      if (round.sourceChapterChanged) chapter.append(paragraph('Restored this chapter from the three-player master; the expanded draft changed its narration.'));
      if (round.sourceCoreChanges) chapter.append(paragraph(
        `Restored ${round.sourceCoreChanges} changed core reading(s) from the three-player master; expanded-draft replacements are not used.`));
      for (const [gi, group] of round.readingGroups.entries()) {
        chapter.append(element('h3', gi === 0 ? 'Original master reading group' : `Supplemental reader ${gi}`));
        for (const reader of group) {
          const clue = round.clues.find(clue => clue.reader === reader);
          chapter.append(element('h4', `${names[reader]} reads about ${names[clue.target]}`), paragraph(clue.text));
        }
      }
      chapter.append(paragraph('After all groups finish: deliberate together, then everyone votes. No playable room is opened by this preview.'));
      content.append(chapter);
    });
    const reveal = element('details');
    reveal.id = 'draft-reveal';
    reveal.append(element('summary', 'Shared ending outline - author approval still needed'), paragraph(edition.reveal));
    content.append(reveal);
  } catch (error) {
    console.error('LOCKDOWN draft selection failed', error);
    status.textContent = error.message;
  }
}

try {
  const response = await fetch('./lockdown-drafts.json');
  if (!response.ok) throw new Error(`Could not load LOCKDOWN drafts (${response.status}).`);
  catalog = await response.json();
  count.addEventListener('input', render);
  render();
} catch (error) {
  console.error('LOCKDOWN preview failed to load', error);
  status.textContent = `Could not load the author-review preview: ${error.message}`;
}
