/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put } from 'redux-saga/effects';

import request from '../request';
import actions from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';

export function* fetchTeams() {
  let teams;
  let teamMemberships = [];
  try {
    const response = yield call(request, api.getTeams);
    teams = response.items;
    if (response.included && response.included.teamMemberships) {
      teamMemberships = response.included.teamMemberships;
    }
  } catch (error) {
    yield put(actions.fetchTeams.failure(error));
    return;
  }

  yield put(actions.fetchTeams.success(teams, teamMemberships));
}

export function* createTeam(data) {
  const localId = yield call(createLocalId);

  yield put(
    actions.createTeam({
      ...data,
      id: localId,
    }),
  );

  let team;
  try {
    ({ item: team } = yield call(request, api.createTeam, data));
  } catch (error) {
    yield put(actions.createTeam.failure(localId, error));
    return;
  }

  yield put(actions.createTeam.success(localId, team));
}

export function* handleTeamCreate(team) {
  yield put(actions.handleTeamCreate(team));
}

export function* updateTeam(id, data) {
  yield put(actions.updateTeam(id, data));

  let team;
  try {
    ({ item: team } = yield call(request, api.updateTeam, id, data));
  } catch (error) {
    yield put(actions.updateTeam.failure(id, error));
    return;
  }

  yield put(actions.updateTeam.success(team));
}

export function* handleTeamUpdate(team) {
  yield put(actions.handleTeamUpdate(team));
}

export function* deleteTeam(id) {
  yield put(actions.deleteTeam(id));

  let team;
  try {
    ({ item: team } = yield call(request, api.deleteTeam, id));
  } catch (error) {
    yield put(actions.deleteTeam.failure(id, error));
    return;
  }

  yield put(actions.deleteTeam.success(team));
}

export function* handleTeamDelete(team) {
  yield put(actions.handleTeamDelete(team));
}

export default {
  fetchTeams,
  createTeam,
  handleTeamCreate,
  updateTeam,
  handleTeamUpdate,
  deleteTeam,
  handleTeamDelete,
};
