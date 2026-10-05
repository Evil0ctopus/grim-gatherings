export function currentCharacter(state, record) {
  return record.charId && record.token && state.claims[record.charId] === record.token
    ? record.charId : null;
}

export function releaseCharacter(state, connections, id) {
  delete state.claims[id];
  for (const record of connections.values()) {
    if (record.charId === id) record.charId = null;
  }
  // Ballots belong to the character and round, not to a particular phone connection.
}

export function retireOtherSessions(connections, record, retire = connection => connection.close()) {
  for (const [connection, other] of connections) {
    if (other !== record && other.token === record.token) {
      other.charId = null;
      connections.delete(connection);
      retire(connection);
    }
  }
}

export function resumeSession(state, connections, record, token, retire) {
  record.token = token;
  record.charId = Object.keys(state.claims).find(id => state.claims[id] === token) || null;
  retireOtherSessions(connections, record, retire);
}
