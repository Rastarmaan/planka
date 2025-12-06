/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* boardTeamsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.BOARD_TEAMS_FETCH, ({ payload: { boardId } }) =>
      services.fetchBoardTeams(boardId),
    ),
    takeEvery(EntryActionTypes.BOARD_TEAM_CREATE, ({ payload: { boardId, data } }) =>
      services.createBoardTeam(boardId, data),
    ),
    takeEvery(EntryActionTypes.BOARD_TEAM_CREATE_HANDLE, ({ payload: { boardTeam } }) =>
      services.handleBoardTeamCreate(boardTeam),
    ),
    takeEvery(EntryActionTypes.BOARD_TEAM_UPDATE, ({ payload: { id, data } }) =>
      services.updateBoardTeam(id, data),
    ),
    takeEvery(EntryActionTypes.BOARD_TEAM_UPDATE_HANDLE, ({ payload: { boardTeam } }) =>
      services.handleBoardTeamUpdate(boardTeam),
    ),
    takeEvery(EntryActionTypes.BOARD_TEAM_DELETE, ({ payload: { id } }) =>
      services.deleteBoardTeam(id),
    ),
    takeEvery(EntryActionTypes.BOARD_TEAM_DELETE_HANDLE, ({ payload: { boardTeam } }) =>
      services.handleBoardTeamDelete(boardTeam),
    ),
  ]);
}
