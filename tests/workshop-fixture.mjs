import blackwater from '../js/editions/blackwater-row.js';
import { REVIEW_ITEMS } from '../js/workshop-core.js';

export function readyDraft() {
  const story = structuredClone(blackwater[4]);
  delete story.edition;
  return { id: 'local-draft', story, locks: [{ term: 'Benjamin Barker', round: 5 }], review: Object.fromEntries(Object.keys(REVIEW_ITEMS).map(key => [key, true])), author: 'Test author', brief: { idea: 'A revenge mystery' } };
}
