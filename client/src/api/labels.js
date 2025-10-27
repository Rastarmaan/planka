/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const getGlobalLabels = (headers) => socket.get('/global-labels', undefined, headers);

const createGlobalLabel = (data, headers) => socket.post('/global-labels', data, headers);

const updateGlobalLabel = (id, data, headers) =>
  socket.patch(`/global-labels/${id}`, data, headers);

const deleteGlobalLabel = (id, headers) =>
  socket.delete(`/global-labels/${id}`, undefined, headers);

const createLabel = (boardId, data, headers) =>
  socket.post(`/boards/${boardId}/labels`, data, headers);

const updateLabel = (id, data, headers) => socket.patch(`/labels/${id}`, data, headers);

const deleteLabel = (id, headers) => socket.delete(`/labels/${id}`, undefined, headers);

export default {
  getGlobalLabels,
  createGlobalLabel,
  updateGlobalLabel,
  deleteGlobalLabel,
  createLabel,
  updateLabel,
  deleteLabel,
};
