/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const fetchDocumentActivities = (params) => ({
  type: ActionTypes.DOCUMENT_ACTIVITIES_FETCH,
  payload: {
    params,
  },
});

fetchDocumentActivities.success = (items, total) => ({
  type: ActionTypes.DOCUMENT_ACTIVITIES_FETCH__SUCCESS,
  payload: {
    items,
    total,
  },
});

fetchDocumentActivities.failure = (error) => ({
  type: ActionTypes.DOCUMENT_ACTIVITIES_FETCH__FAILURE,
  payload: {
    error,
  },
});

export default {
  fetchDocumentActivities,
};
