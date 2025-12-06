/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put } from 'redux-saga/effects';

import request from '../request';
import actions from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';

export function* fetchBoardTeams(boardId) {
  let boardTeams;
  try {
    ({ items: boardTeams } = yield call(request, api.getBoardTeams, boardId));
  } catch {
    return;
  }

  yield put(actions.fetchBoardTeams(boardTeams));
}

export function* createBoardTeam(boardId, data) {
  const localId = yield call(createLocalId);

  yield put(
    actions.createBoardTeam({
      ...data,
      boardId,
      id: localId,
    }),
  );

  let boardTeam;
  let boardMemberships;
  let users;
  try {
    ({
      item: boardTeam,
      included: { boardMemberships, users },
    } = yield call(request, api.createBoardTeam, boardId, data));
  } catch (error) {
    yield put(actions.createBoardTeam.failure(localId, error));
    return;
  }

  yield put(actions.createBoardTeam.success(localId, boardTeam, boardMemberships, users));
}

export function* handleBoardTeamCreate(boardTeam) {
  yield put(actions.handleBoardTeamCreate(boardTeam));
}

export function* updateBoardTeam(id, data) {
  yield put(actions.updateBoardTeam(id, data));

  let boardTeam;
  try {
    ({ item: boardTeam } = yield call(request, api.updateBoardTeam, id, data));
  } catch (error) {
    yield put(actions.updateBoardTeam.failure(id, error));
    return;
  }

  yield put(actions.updateBoardTeam.success(boardTeam));
}

export function* handleBoardTeamUpdate(boardTeam) {
  yield put(actions.handleBoardTeamUpdate(boardTeam));
}

export function* deleteBoardTeam(id) {
  yield put(actions.deleteBoardTeam(id));

  let boardTeam;
  try {
    ({ item: boardTeam } = yield call(request, api.deleteBoardTeam, id));
  } catch (error) {
    yield put(actions.deleteBoardTeam.failure(id, error));
    return;
  }

  yield put(actions.deleteBoardTeam.success(boardTeam));
}

export function* handleBoardTeamDelete(boardTeam) {
  yield put(actions.handleBoardTeamDelete(boardTeam));
}

export default {
  fetchBoardTeams,
  createBoardTeam,
  handleBoardTeamCreate,
  updateBoardTeam,
  handleBoardTeamUpdate,
  deleteBoardTeam,
  handleBoardTeamDelete,
};
