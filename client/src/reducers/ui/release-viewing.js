/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../../constants/ActionTypes';

const initialState = {
  viewingReleaseId: null,
  releaseSnapshot: null,
  isSnapshotLoading: false,
};

export default (action, state = initialState) => {
  const { type, payload } = action;
  switch (type) {
    case ActionTypes.RELEASE_SNAPSHOT_VIEW_SET:
      return {
        ...state,
        viewingReleaseId: payload.releaseId,
        isSnapshotLoading: true,
      };
    case ActionTypes.RELEASE_SNAPSHOT_VIEW_CLEAR:
      return {
        ...state,
        viewingReleaseId: null,
        releaseSnapshot: null,
        isSnapshotLoading: false,
      };
    case ActionTypes.RELEASE_SNAPSHOT_FETCH__SUCCESS:
      return {
        ...state,
        releaseSnapshot: payload.snapshot,
        isSnapshotLoading: false,
      };
    case ActionTypes.RELEASE_SNAPSHOT_FETCH__FAILURE:
      return {
        ...state,
        releaseSnapshot: null,
        isSnapshotLoading: false,
      };
    case ActionTypes.LOCATION_CHANGE_HANDLE:
      return state;
    default:
      return state;
  }
};
