/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const fetchBoardTeams = (boardTeams) => ({
  type: ActionTypes.BOARD_TEAMS_FETCH__SUCCESS,
  payload: {
    boardTeams,
  },
});

const createBoardTeam = (boardTeam) => ({
  type: ActionTypes.BOARD_TEAM_CREATE,
  payload: {
    boardTeam,
  },
});

createBoardTeam.success = (localId, boardTeam, boardMemberships, users) => ({
  type: ActionTypes.BOARD_TEAM_CREATE__SUCCESS,
  payload: {
    localId,
    boardTeam,
    boardMemberships,
    users,
  },
});

createBoardTeam.failure = (localId, error) => ({
  type: ActionTypes.BOARD_TEAM_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleBoardTeamCreate = (boardTeam) => ({
  type: ActionTypes.BOARD_TEAM_CREATE_HANDLE,
  payload: {
    boardTeam,
  },
});

const updateBoardTeam = (id, data) => ({
  type: ActionTypes.BOARD_TEAM_UPDATE,
  payload: {
    id,
    data,
  },
});

updateBoardTeam.success = (boardTeam) => ({
  type: ActionTypes.BOARD_TEAM_UPDATE__SUCCESS,
  payload: {
    boardTeam,
  },
});

updateBoardTeam.failure = (id, error) => ({
  type: ActionTypes.BOARD_TEAM_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleBoardTeamUpdate = (boardTeam) => ({
  type: ActionTypes.BOARD_TEAM_UPDATE_HANDLE,
  payload: {
    boardTeam,
  },
});

const deleteBoardTeam = (id) => ({
  type: ActionTypes.BOARD_TEAM_DELETE,
  payload: {
    id,
  },
});

deleteBoardTeam.success = (boardTeam) => ({
  type: ActionTypes.BOARD_TEAM_DELETE__SUCCESS,
  payload: {
    boardTeam,
  },
});

deleteBoardTeam.failure = (id, error) => ({
  type: ActionTypes.BOARD_TEAM_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleBoardTeamDelete = (boardTeam, boardMemberships) => ({
  type: ActionTypes.BOARD_TEAM_DELETE_HANDLE,
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
