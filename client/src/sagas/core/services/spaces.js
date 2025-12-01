/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import request from '../request';

export function* createSpace(data, localId) {
  let space;
  try {
    ({ item: space } = yield call(request, api.createSpace, data));
  } catch (error) {
    yield put(actions.createSpace.failure(localId, error));
    return;
  }

  yield put(actions.createSpace.success(localId, space));
}

export function* fetchSpaces() {
  let spaces;
  try {
    ({ items: spaces } = yield call(request, api.getSpaces));
  } catch (error) {
    yield put(actions.fetchSpaces.failure(error));
    return;
  }

  yield put(actions.fetchSpaces.success(spaces));
}

export function* fetchSpace(id) {
  let space;
  try {
    ({ item: space } = yield call(request, api.getSpace, id));
  } catch (error) {
    yield put(actions.fetchSpace.failure(error));
    return;
  }

  yield put(actions.fetchSpace.success(space));
}

export function* updateSpace(id, data) {
  try {
    const { item: space } = yield call(request, api.updateSpace, id, data);
    yield put(actions.updateSpace.success(space));
  } catch (error) {
    yield put(actions.updateSpace.failure(error));
  }
}

export function* deleteSpace(id) {
  try {
    yield call(request, api.deleteSpace, id);
    yield put(actions.deleteSpace.success(id));
  } catch (error) {
    yield put(actions.deleteSpace.failure(error));
  }
}

export function* handleSpaceCreate(space) {
  yield put({
    type: 'SPACE_CREATE_HANDLE',
    payload: { space },
  });
}

export function* handleSpaceUpdate(space) {
  yield put({
    type: 'SPACE_UPDATE_HANDLE',
    payload: { space },
  });
}

export function* handleSpaceDelete(space) {
  yield put({
    type: 'SPACE_DELETE_HANDLE',
    payload: { space },
  });
}
