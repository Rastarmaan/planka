/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const initialState = {
  items: [],
  total: 0,
  isFetching: false,
  error: null,
};

// eslint-disable-next-line default-param-last
export default (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case ActionTypes.DOCUMENT_ACTIVITIES_FETCH:
      return {
        ...state,
        isFetching: true,
        error: null,
      };
    case ActionTypes.DOCUMENT_ACTIVITIES_FETCH__SUCCESS:
      return {
        ...state,
        items: payload.items,
        total: payload.total,
        isFetching: false,
      };
    case ActionTypes.DOCUMENT_ACTIVITIES_FETCH__FAILURE:
      return {
        ...state,
        isFetching: false,
        error: payload.error,
      };
    default:
      return state;
  }
};
