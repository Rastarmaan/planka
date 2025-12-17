/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import request from '../request';

export function* fetchProjectStats(projectId) {
  let data;

  try {
    data = yield call(request, api.fetchProjectStats, projectId);
  } catch (error) {
    yield put(actions.fetchProjectStats.failure(projectId, error));
    return;
  }

  yield put(actions.fetchProjectStats.success(projectId, data));
}

export default {
  fetchProjectStats,
};
