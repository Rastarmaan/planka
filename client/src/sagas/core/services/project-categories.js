/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import request from '../request';

export function* getProjectCategories() {
  let projectCategories;

  try {
    ({ items: projectCategories } = yield call(request, api.getProjectCategories));
  } catch (error) {
    return;
  }

  yield put(actions.handleProjectCategories(projectCategories));
}

export function* createProjectCategory(data) {
  yield put(actions.createProjectCategory(data));

  let projectCategory;

  try {
    ({ item: projectCategory } = yield call(request, api.createProjectCategory, data));
  } catch (error) {
    yield put(actions.createProjectCategory.failure(error));
    return;
  }

  yield put(actions.createProjectCategory.success(projectCategory));
}

export function* updateProjectCategory(id, data) {
  yield put(actions.updateProjectCategory(id, data));

  let projectCategory;

  try {
    ({ item: projectCategory } = yield call(request, api.updateProjectCategory, id, data));
  } catch (error) {
    yield put(actions.updateProjectCategory.failure(id, error));
    return;
  }

  yield put(actions.updateProjectCategory.success(projectCategory));
}

export function* deleteProjectCategory(id) {
  yield put(actions.deleteProjectCategory(id));

  let projectCategory;

  try {
    ({ item: projectCategory } = yield call(request, api.deleteProjectCategory, id));
  } catch (error) {
    yield put(actions.deleteProjectCategory.failure(id, error));
    return;
  }

  yield put(actions.deleteProjectCategory.success(projectCategory));
}

export default {
  getProjectCategories,
  createProjectCategory,
  updateProjectCategory,
  deleteProjectCategory,
};
