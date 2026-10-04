import { esc } from './util.js?v=f1ed522';

export function roundBallots(state) {
  if (!state.roundVotes) {
    state.roundVotes = {};
    if (['vote', 'reveal'].includes(state.phase) && state.roundIndex >= 0) {
      state.roundVotes[state.roundIndex] = { ...state.votes };
    }
  }
  return state.roundVotes;
}

export function selectRoundBallots(state, index) {
  const rounds = roundBallots(state);
  state.votes = rounds[index] ||= {};
}

export function voteSummary(state) {
  const ids = new Set(state.story.characters.map(c => c.id));
  const rounds = Object.entries(roundBallots(state))
    .filter(([index]) => Number(index) <= state.roundIndex)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([index, ballots]) => {
      const counts = Object.fromEntries([...ids].map(id => [id, 0]));
      for (const [voter, suspect] of Object.entries(ballots)) {
        if (ids.has(voter) && ids.has(suspect)) counts[suspect]++;
      }
      return { index: Number(index), counts, total: Object.values(counts).reduce((a, b) => a + b, 0) };
    });
  const totals = Object.fromEntries([...ids].map(id => [id, 0]));
  for (const round of rounds) for (const id of ids) totals[id] += round.counts[id];
  const total = Object.values(totals).reduce((a, b) => a + b, 0);
  const max = Math.max(0, ...Object.values(totals));
  const leaders = max ? [...ids].filter(id => totals[id] === max) : [];
  const latest = rounds.at(-1);
  const previousTotal = total - (latest?.total || 0);
  const suspects = state.story.characters.map(c => {
    const share = total ? totals[c.id] / total * 100 : 0;
    const previousShare = previousTotal ? (totals[c.id] - latest.counts[c.id]) / previousTotal * 100 : null;
    return { id: c.id, name: c.name, count: totals[c.id], share, change: previousShare === null ? null : share - previousShare };
  });
  return { rounds, suspects, total, leaders };
}

export function voteStripHtml(summary) {
  const { rounds, suspects, total, leaders } = summary;
  const top = suspects.filter(s => leaders.includes(s.id));
  const change = top.length === 1 && top[0].change !== null ? ` (${top[0].change >= 0 ? '+' : ''}${Math.round(top[0].change)}pp)` : '';
  const leader = top.length ? `${top.length > 1 ? 'Tied: ' : 'Top: '}${top.map(s => s.name).join(' / ')} ${Math.round(top[0].share)}%${change}` : 'No votes yet';
  const chips = rounds.map(r => {
    const max = Math.max(0, ...Object.values(r.counts));
    const names = suspects.filter(s => max && r.counts[s.id] === max).map(s => s.name);
    return `<span class="vote-chip">R${r.index + 1}: ${esc(names.join(' / ') || 'No votes')} ${r.total ? Math.round(max / r.total * 100) + '%' : ''}</span>`;
  });
  const shares = suspects.map(s => `<span class="vote-chip">${esc(s.name)} ${Math.round(s.share)}%${s.change === null ? '' : ` (${s.change >= 0 ? '+' : ''}${Math.round(s.change)}pp)`} · ${rounds.map(r => `R${r.index + 1}:${r.counts[s.id]}`).join(' ')}</span>`);
  const compact = top.length ? `${top.length > 1 ? 'Tie' : 'Votes'} · ${Math.round(top[0].share)}%` : 'Votes';
  return `<summary title="Open suspect voting history"><span class="vote-strip-label">${esc(leader)}</span><span class="vote-compact">${esc(compact)}</span><span class="vote-expand" aria-hidden="true">▾</span></summary>
    <div class="vote-history"><strong>Suspect voting history</strong><p>${esc(leader)}</p>
      ${rounds.length ? chips.join('') + shares.join('') : '<p>Suspect votes open after each round.</p>'}
      <p class="small muted">${total} ballots · vote share, not guilt probability · pp = percentage points</p></div>`;
}
