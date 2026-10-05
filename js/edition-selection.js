export function selectEdition(catalog, guests, assignedGuests = guests) {
  const counts = Object.keys(catalog.editions).map(Number).sort((a, b) => a - b);
  const edition = catalog.editions[guests.length];
  if (!edition) throw new Error(`This mystery works for ${counts[0]}–${counts.at(-1)} players. You listed ${guests.length}. Choose a supported count before starting.`);
  if (assignedGuests.length !== guests.length) throw new Error('Every player needs exactly one character assignment.');
  const story = structuredClone(edition);
  story.characters.forEach((c, i) => {
    c.guest = assignedGuests[i].name;
    c.guestNote = assignedGuests[i].desc || '';
  });
  return story;
}
