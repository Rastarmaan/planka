import http from './http';

export const getBoardReleases = (boardId, headers) =>
  http.get(`/boards/${boardId}/releases`, undefined, headers);

export const createBoardRelease = (boardId, data, headers) =>
  http.post(`/boards/${boardId}/releases`, data, headers);

export const updateBoardRelease = (boardId, id, data, headers) =>
  http.put(`/boards/${boardId}/releases/${id}`, data, headers);

export const updateBoardReleaseStatus = (boardId, id, status, headers) =>
  http.patch(`/boards/${boardId}/releases/${id}/status`, { status }, headers);

export const deleteBoardRelease = (boardId, id, headers) =>
  http.delete(`/boards/${boardId}/releases/${id}`, undefined, headers);

export const addCardToRelease = (releaseId, cardId, headers) =>
  http.post(`/releases/${releaseId}/cards`, { cardId }, headers);

export const removeCardFromRelease = (releaseId, cardId, headers) =>
  http.delete(`/releases/${releaseId}/cards/${cardId}`, undefined, headers);

export const getReleaseSnapshot = (boardId, releaseId, headers) =>
  http.get(`/boards/${boardId}/releases/${releaseId}/snapshot`, undefined, headers);

export default {
  getBoardReleases,
  createBoardRelease,
  updateBoardRelease,
  updateBoardReleaseStatus,
  deleteBoardRelease,
  addCardToRelease,
  removeCardFromRelease,
  getReleaseSnapshot,
};
