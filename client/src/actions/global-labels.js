/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const getGlobalLabels = () => ({
  type: ActionTypes.GLOBAL_LABELS_GET,
});

getGlobalLabels.success = (labels) => ({
  type: ActionTypes.GLOBAL_LABELS_GET__SUCCESS,
  payload: {
    labels,
  },
});

getGlobalLabels.failure = (error) => ({
  type: ActionTypes.GLOBAL_LABELS_GET__FAILURE,
  payload: {
    error,
  },
});

const createGlobalLabel = (label) => ({
  type: ActionTypes.GLOBAL_LABEL_CREATE,
  payload: {
    label,
  },
});

createGlobalLabel.success = (localId, label) => ({
  type: ActionTypes.GLOBAL_LABEL_CREATE__SUCCESS,
  payload: {
    localId,
    label,
  },
});

createGlobalLabel.failure = (localId, error) => ({
  type: ActionTypes.GLOBAL_LABEL_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleGlobalLabelCreate = (label) => ({
  type: ActionTypes.GLOBAL_LABEL_CREATE_HANDLE,
  payload: {
    label,
  },
});

const updateGlobalLabel = (id, data) => ({
  type: ActionTypes.GLOBAL_LABEL_UPDATE,
  payload: {
    id,
    data,
  },
});

updateGlobalLabel.success = (label) => ({
  type: ActionTypes.GLOBAL_LABEL_UPDATE__SUCCESS,
  payload: {
    label,
  },
});

updateGlobalLabel.failure = (id, error) => ({
  type: ActionTypes.GLOBAL_LABEL_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleGlobalLabelUpdate = (label) => ({
  type: ActionTypes.GLOBAL_LABEL_UPDATE_HANDLE,
  payload: {
    label,
  },
});

const deleteGlobalLabel = (id) => ({
  type: ActionTypes.GLOBAL_LABEL_DELETE,
  payload: {
    id,
  },
});

deleteGlobalLabel.success = (label) => ({
  type: ActionTypes.GLOBAL_LABEL_DELETE__SUCCESS,
  payload: {
    label,
  },
});

deleteGlobalLabel.failure = (id, error) => ({
  type: ActionTypes.GLOBAL_LABEL_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleGlobalLabelDelete = (label) => ({
  type: ActionTypes.GLOBAL_LABEL_DELETE_HANDLE,
  payload: {
    label,
  },
});

export default {
  getGlobalLabels,
  createGlobalLabel,
  handleGlobalLabelCreate,
  updateGlobalLabel,
  handleGlobalLabelUpdate,
  deleteGlobalLabel,
  handleGlobalLabelDelete,
};
