/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const handleSpaceCreate = (space) => ({
  type: ActionTypes.SPACE_CREATE_HANDLE,
  payload: {
    space,
  },
});

const handleSpaceUpdate = (space) => ({
  type: ActionTypes.SPACE_UPDATE_HANDLE,
  payload: {
    space,
  },
});

const handleSpaceDelete = (space) => ({
  type: ActionTypes.SPACE_DELETE_HANDLE,
  payload: {
    space,
  },
});

export default {
  handleSpaceCreate,
  handleSpaceUpdate,
  handleSpaceDelete,
};
