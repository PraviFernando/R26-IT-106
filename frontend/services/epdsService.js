import api from './api';

// answers: array of 10 raw EPDS scores (0–3 each), already forward/reverse-mapped
// by the caller. The backend re-sums and re-bands, so it stays the source of truth.
export const submitScreening = (answers) =>
  api.post('/epds/submit', { answers }).then((r) => r.data);

// Returns this calendar month's screening ({ totalScore, riskLevel, ... }) or null.
export const getCurrentScreening = () =>
  api.get('/epds/current').then((r) => r.data);

export default { submitScreening, getCurrentScreening };
