/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const getGlobalLabels = () => ({
  type: EntryActionTypes.GLOBAL_LABELS_GET,
});

const createGlobalLabel = (data) => ({
  type: EntryActionTypes.GLOBAL_LABEL_CREATE,
  payload: {
    data,
  },
});

const handleGlobalLabelCreate = (label) => ({
  type: EntryActionTypes.GLOBAL_LABEL_CREATE_HANDLE,
  payload: {
    label,
  },
});

const updateGlobalLabel = (id, data) => ({
  type: EntryActionTypes.GLOBAL_LABEL_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleGlobalLabelUpdate = (label) => ({
  type: EntryActionTypes.GLOBAL_LABEL_UPDATE_HANDLE,
  payload: {
    label,
  },
});

const deleteGlobalLabel = (id) => ({
  type: EntryActionTypes.GLOBAL_LABEL_DELETE,
  payload: {
    id,
  },
});

const handleGlobalLabelDelete = (label) => ({
  type: EntryActionTypes.GLOBAL_LABEL_DELETE_HANDLE,
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
