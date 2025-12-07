/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const fetchBoardTeams = (boardId) => ({
  type: EntryActionTypes.BOARD_TEAMS_FETCH,
  payload: {
    boardId,
  },
});

const createBoardTeam = (boardId, data) => ({
  type: EntryActionTypes.BOARD_TEAM_CREATE,
  payload: {
    boardId,
    data,
  },
});

const handleBoardTeamCreate = (boardTeam) => ({
  type: EntryActionTypes.BOARD_TEAM_CREATE_HANDLE,
  payload: {
    boardTeam,
  },
});

const updateBoardTeam = (id, data) => ({
  type: EntryActionTypes.BOARD_TEAM_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleBoardTeamUpdate = (boardTeam) => ({
  type: EntryActionTypes.BOARD_TEAM_UPDATE_HANDLE,
  payload: {
    boardTeam,
  },
});

const deleteBoardTeam = (id) => ({
  type: EntryActionTypes.BOARD_TEAM_DELETE,
  payload: {
    id,
  },
});

const handleBoardTeamDelete = (boardTeam, boardMemberships) => ({
  type: EntryActionTypes.BOARD_TEAM_DELETE_HANDLE,
  payload: {
    boardTeam,
    boardMemberships,
  },
});

export default {
  fetchBoardTeams,
  createBoardTeam,
  handleBoardTeamCreate,
  updateBoardTeam,
  handleBoardTeamUpdate,
  deleteBoardTeam,
  handleBoardTeamDelete,
};
