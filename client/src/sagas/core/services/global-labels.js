/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';
import request from '../request';

export function* getGlobalLabels() {
  let globalLabels;
  try {
    ({ items: globalLabels } = yield call(request, api.getGlobalLabels));
  } catch (error) {
    yield put(actions.getGlobalLabels.failure(error));
    return;
  }

  yield put(actions.getGlobalLabels.success(globalLabels));
}

export function* createGlobalLabel(data) {
  const localId = yield call(createLocalId);

  yield put(
    actions.createGlobalLabel({
      ...data,
      id: localId,
      isGlobal: true,
      position: 0,
    }),
  );

  let globalLabel;
  try {
    ({ item: globalLabel } = yield call(request, api.createGlobalLabel, data));
  } catch (error) {
    yield put(actions.createGlobalLabel.failure(localId, error));
    return;
  }

  yield put(actions.createGlobalLabel.success(localId, globalLabel));
}

export function* handleGlobalLabelCreate(label) {
  yield put(actions.handleGlobalLabelCreate(label));
}

export function* updateGlobalLabel(id, data) {
  let globalLabel;
  try {
    ({ item: globalLabel } = yield call(request, api.updateGlobalLabel, id, data));
  } catch (error) {
    yield put(actions.updateGlobalLabel.failure(id, error));
    return;
  }

  yield put(actions.updateGlobalLabel.success(globalLabel));
}

export function* handleGlobalLabelUpdate(label) {
  yield put(actions.handleGlobalLabelUpdate(label));
}

export function* deleteGlobalLabel(id) {
  let globalLabel;
  try {
    ({ item: globalLabel } = yield call(request, api.deleteGlobalLabel, id));
  } catch (error) {
    yield put(actions.deleteGlobalLabel.failure(id, error));
    return;
  }

  yield put(actions.deleteGlobalLabel.success(globalLabel));
}

export function* handleGlobalLabelDelete(label) {
  yield put(actions.handleGlobalLabelDelete(label));
}

export default {
  getGlobalLabels,
  createGlobalLabel,
  handleGlobalLabelCreate,
  updateGlobalLabel,
  handleGlobalLabelUpdate,
  deleteGlobalLabel,
  handleGlobalLabelDelete,
};
