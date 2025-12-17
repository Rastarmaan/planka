/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const fetchProjectStats = (projectId) => ({
  type: EntryActionTypes.PROJECT_STATS_FETCH,
  payload: {
    projectId,
  },
});

export default {
  fetchProjectStats,
};
