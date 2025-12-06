/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put } from 'redux-saga/effects';

import request from '../request';
import actions from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';

export function* createProjectTeam(projectId, data) {
  const localId = yield call(createLocalId);

  yield put(
    actions.createProjectTeam({
      ...data,
      projectId,
      id: localId,
    }),
  );

  let projectTeam;
  try {
    ({ item: projectTeam } = yield call(request, api.createProjectTeam, projectId, data));
  } catch (error) {
    yield put(actions.createProjectTeam.failure(localId, error));
    return;
  }

  yield put(actions.createProjectTeam.success(localId, projectTeam));
}

export function* handleProjectTeamCreate(projectTeam) {
  yield put(actions.handleProjectTeamCreate(projectTeam));
}

export function* updateProjectTeam(id, data) {
  yield put(actions.updateProjectTeam(id, data));

  let projectTeam;
  try {
    ({ item: projectTeam } = yield call(request, api.updateProjectTeam, id, data));
  } catch (error) {
    yield put(actions.updateProjectTeam.failure(id, error));
    return;
  }

  yield put(actions.updateProjectTeam.success(projectTeam));
}

export function* handleProjectTeamUpdate(projectTeam) {
  yield put(actions.handleProjectTeamUpdate(projectTeam));
}

export function* deleteProjectTeam(id) {
  yield put(actions.deleteProjectTeam(id));

  let projectTeam;
  try {
    ({ item: projectTeam } = yield call(request, api.deleteProjectTeam, id));
  } catch (error) {
    yield put(actions.deleteProjectTeam.failure(id, error));
    return;
  }

  yield put(actions.deleteProjectTeam.success(projectTeam));
}

export function* handleProjectTeamDelete(projectTeam) {
  yield put(actions.handleProjectTeamDelete(projectTeam));
}

export default {
  createProjectTeam,
  handleProjectTeamCreate,
  updateProjectTeam,
  handleProjectTeamUpdate,
  deleteProjectTeam,
  handleProjectTeamDelete,
};
