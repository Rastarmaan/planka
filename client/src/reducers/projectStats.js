/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const initialState = {
  byProjectId: {},
};

// eslint-disable-next-line default-param-last
export default function projectStats(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case ActionTypes.PROJECT_STATS_FETCH: {
      const { projectId } = payload;
      const prev = state.byProjectId[projectId] || {};

      return {
        ...state,
        byProjectId: {
          ...state.byProjectId,
          [projectId]: {
            ...prev,
            isLoading: true,
            error: null,
          },
        },
      };
    }
    case ActionTypes.PROJECT_STATS_FETCH__SUCCESS: {
      const { projectId, data } = payload;

      return {
        ...state,
        byProjectId: {
          ...state.byProjectId,
          [projectId]: {
            data,
            isLoading: false,
            error: null,
            receivedAt: Date.now(),
          },
        },
      };
    }
    case ActionTypes.PROJECT_STATS_FETCH__FAILURE: {
      const { projectId, error } = payload;

      return {
        ...state,
        byProjectId: {
          ...state.byProjectId,
          [projectId]: {
            data: null,
            isLoading: false,
            error,
          },
        },
      };
    }
    default:
      return state;
  }
}
