/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const fetchProjectStats = (projectId) => ({
  type: ActionTypes.PROJECT_STATS_FETCH,
  payload: {
    projectId,
  },
});

fetchProjectStats.success = (projectId, data) => ({
  type: ActionTypes.PROJECT_STATS_FETCH__SUCCESS,
  payload: {
    projectId,
    data,
  },
});

fetchProjectStats.failure = (projectId, error) => ({
  type: ActionTypes.PROJECT_STATS_FETCH__FAILURE,
  payload: {
    projectId,
    error,
  },
});

export default {
  fetchProjectStats,
};
