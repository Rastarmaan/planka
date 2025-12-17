/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import request from '../request';

export function* fetchProjectHistories(projectId, search) {
  let items;

  try {
    ({ items } = yield call(request, api.fetchProjectHistories, projectId, search));
  } catch (error) {
    yield put(actions.fetchProjectHistories.failure(projectId, error));
    return;
  }

  yield put(actions.fetchProjectHistories.success(projectId, items));
}

export function* createProjectHistory(projectId, data) {
  yield put(actions.createProjectHistory(projectId, data));

  let item;

  try {
    ({ item } = yield call(request, api.createProjectHistory, projectId, data));
  } catch (error) {
    yield put(actions.createProjectHistory.failure(error));
    return;
  }

  yield put(actions.createProjectHistory.success(item));
}

export function* updateProjectHistory(id, data) {
  yield put(actions.updateProjectHistory(id, data));

  let item;

  try {
    ({ item } = yield call(request, api.updateProjectHistory, id, data));
  } catch (error) {
    yield put(actions.updateProjectHistory.failure(id, error));
    return;
  }

  yield put(actions.updateProjectHistory.success(item));
}

export function* deleteProjectHistory(id) {
  yield put(actions.deleteProjectHistory(id));

  let item;

  try {
    ({ item } = yield call(request, api.deleteProjectHistory, id));
  } catch (error) {
    yield put(actions.deleteProjectHistory.failure(id, error));
    return;
  }

  yield put(actions.deleteProjectHistory.success(item));
}

export function* handleProjectHistoryCreate(item) {
  yield put(actions.handleProjectHistoryCreate(item));
}

export function* handleProjectHistoryUpdate(item) {
  yield put(actions.handleProjectHistoryUpdate(item));
}

export function* handleProjectHistoryDelete(item) {
  yield put(actions.handleProjectHistoryDelete(item));
}

export default {
  fetchProjectHistories,
  createProjectHistory,
  updateProjectHistory,
  deleteProjectHistory,
  handleProjectHistoryCreate,
  handleProjectHistoryUpdate,
  handleProjectHistoryDelete,
};
