/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const createPermission = (data) => ({
  type: ActionTypes.PERMISSION_CREATE,
  payload: {
    data,
  },
});

createPermission.success = (permission) => ({
  type: ActionTypes.PERMISSION_CREATE__SUCCESS,
  payload: {
    permission,
  },
});

createPermission.failure = (error) => ({
  type: ActionTypes.PERMISSION_CREATE__FAILURE,
  payload: {
    error,
  },
});

const fetchPermissions = (params) => ({
  type: ActionTypes.PERMISSIONS_FETCH,
  payload: {
    params,
  },
});

fetchPermissions.success = (permissions) => ({
  type: ActionTypes.PERMISSIONS_FETCH__SUCCESS,
  payload: {
    permissions,
  },
});

fetchPermissions.failure = (error) => ({
  type: ActionTypes.PERMISSIONS_FETCH__FAILURE,
  payload: {
    error,
  },
});

const deletePermission = (id) => ({
  type: ActionTypes.PERMISSION_DELETE,
  payload: {
    id,
  },
});

deletePermission.success = (permission) => ({
  type: ActionTypes.PERMISSION_DELETE__SUCCESS,
  payload: {
    permission,
  },
});

deletePermission.failure = (error) => ({
  type: ActionTypes.PERMISSION_DELETE__FAILURE,
  payload: {
    error,
  },
});

export default {
  createPermission,
  fetchPermissions,
  deletePermission,
};
