/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import request from '../request';

export function* createPermission(data) {
  yield call(request, api.createPermission, data);
}

export function* fetchPermissions(params) {
  yield call(request, api.getPermissions, params);
}

export function* deletePermission(id) {
  yield call(request, api.deletePermission, id);
}

export function* handlePermissionCreate(permission) {
  yield put(actions.createPermission.success(permission));
}

export function* handlePermissionDelete(permission) {
  yield put(actions.deletePermission.success(permission));
}
