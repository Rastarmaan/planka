/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import ActionTypes from '../../../constants/ActionTypes';
import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* permissionsWatchers() {
  yield all([
    takeEvery(ActionTypes.PERMISSION_CREATE, ({ payload: { data } }) =>
      services.createPermission(data),
    ),
    takeEvery(ActionTypes.PERMISSIONS_FETCH, ({ payload: { params } }) =>
      services.fetchPermissions(params),
    ),
    takeEvery(ActionTypes.PERMISSION_DELETE, ({ payload: { id } }) =>
      services.deletePermission(id),
    ),
    takeEvery(EntryActionTypes.PERMISSION_CREATE_HANDLE, ({ payload: { permission } }) =>
      services.handlePermissionCreate(permission),
    ),
    takeEvery(EntryActionTypes.PERMISSION_DELETE_HANDLE, ({ payload: { permission } }) =>
      services.handlePermissionDelete(permission),
    ),
  ]);
}
