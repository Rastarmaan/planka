/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const handlePermissionCreate = (permission) => ({
  type: ActionTypes.PERMISSION_CREATE_HANDLE,
  payload: {
    permission,
  },
});

const handlePermissionDelete = (permission) => ({
  type: ActionTypes.PERMISSION_DELETE_HANDLE,
  payload: {
    permission,
  },
});

export default {
  handlePermissionCreate,
  handlePermissionDelete,
};
