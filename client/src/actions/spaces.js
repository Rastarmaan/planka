/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const createSpace = (space) => ({
  type: ActionTypes.SPACE_CREATE,
  payload: {
    space,
  },
});

createSpace.success = (localId, space) => ({
  type: ActionTypes.SPACE_CREATE__SUCCESS,
  payload: {
    localId,
    space,
  },
});

createSpace.failure = (localId, error) => ({
  type: ActionTypes.SPACE_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const fetchSpaces = () => ({
  type: ActionTypes.SPACES_FETCH,
});

fetchSpaces.success = (spaces) => ({
  type: ActionTypes.SPACES_FETCH__SUCCESS,
  payload: {
    spaces,
  },
});

fetchSpaces.failure = (error) => ({
  type: ActionTypes.SPACES_FETCH__FAILURE,
  payload: {
    error,
  },
});

const fetchSpace = (id) => ({
  type: ActionTypes.SPACE_FETCH,
  payload: {
    id,
  },
});

fetchSpace.success = (space) => ({
  type: ActionTypes.SPACE_FETCH__SUCCESS,
  payload: {
    space,
  },
});

fetchSpace.failure = (error) => ({
  type: ActionTypes.SPACE_FETCH__FAILURE,
  payload: {
    error,
  },
});

const updateSpace = (id, data) => ({
  type: ActionTypes.SPACE_UPDATE,
  payload: {
    id,
    data,
  },
});

updateSpace.success = (space) => ({
  type: ActionTypes.SPACE_UPDATE__SUCCESS,
  payload: {
    space,
  },
});

updateSpace.failure = (error) => ({
  type: ActionTypes.SPACE_UPDATE__FAILURE,
  payload: {
    error,
  },
});

const deleteSpace = (id) => ({
  type: ActionTypes.SPACE_DELETE,
  payload: {
    id,
  },
});

deleteSpace.success = (id) => ({
  type: ActionTypes.SPACE_DELETE__SUCCESS,
  payload: {
    id,
  },
});

deleteSpace.failure = (error) => ({
  type: ActionTypes.SPACE_DELETE__FAILURE,
  payload: {
    error,
  },
});

export default {
  createSpace,
  fetchSpaces,
  fetchSpace,
  updateSpace,
  deleteSpace,
};
