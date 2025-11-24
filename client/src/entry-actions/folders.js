/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const handleFolderCreate = (folder) => ({
  type: ActionTypes.FOLDER_CREATE_HANDLE,
  payload: {
    folder,
  },
});

const handleFolderUpdate = (folder) => ({
  type: ActionTypes.FOLDER_UPDATE_HANDLE,
  payload: {
    folder,
  },
});

const handleFolderDelete = (folder) => ({
  type: ActionTypes.FOLDER_DELETE_HANDLE,
  payload: {
    folder,
  },
});

export default {
  handleFolderCreate,
  handleFolderUpdate,
  handleFolderDelete,
};
