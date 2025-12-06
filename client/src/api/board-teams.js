/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const getBoardTeams = (boardId, headers) =>
  socket.get(`/boards/${boardId}/board-teams`, undefined, headers);

const createBoardTeam = (boardId, data, headers) =>
  socket.post(`/boards/${boardId}/board-teams`, data, headers);

const updateBoardTeam = (id, data, headers) => socket.patch(`/board-teams/${id}`, data, headers);

const deleteBoardTeam = (id, headers) => socket.delete(`/board-teams/${id}`, undefined, headers);

export default {
  getBoardTeams,
  createBoardTeam,
  updateBoardTeam,
  deleteBoardTeam,
};
