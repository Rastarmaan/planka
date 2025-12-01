/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const addReleaseToFilterInCurrentBoard = (id) => ({
  type: EntryActionTypes.RELEASE_TO_FILTER_IN_CURRENT_BOARD_ADD,
  payload: {
    id,
  },
});

const removeReleaseFromFilterInCurrentBoard = (id) => ({
  type: EntryActionTypes.RELEASE_FROM_FILTER_IN_CURRENT_BOARD_REMOVE,
  payload: {
    id,
  },
});

export default {
  addReleaseToFilterInCurrentBoard,
  removeReleaseFromFilterInCurrentBoard,
};
