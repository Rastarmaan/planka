/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const handleFileCreate = (file) => ({
  type: ActionTypes.FILE_CREATE_HANDLE,
  payload: {
    file,
  },
});

const handleFileUpdate = (file) => ({
  type: ActionTypes.FILE_UPDATE_HANDLE,
  payload: {
    file,
  },
});

const handleFileDelete = (file) => ({
  type: ActionTypes.FILE_DELETE_HANDLE,
  payload: {
    file,
  },
});

export default {
  handleFileCreate,
  handleFileUpdate,
  handleFileDelete,
};
