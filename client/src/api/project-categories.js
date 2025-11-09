/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const getProjectCategories = (headers) => socket.get('/project-categories', undefined, headers);

const createProjectCategory = (data, headers) => socket.post('/project-categories', data, headers);

const getProjectCategory = (id, headers) =>
  socket.get(`/project-categories/${id}`, undefined, headers);

const updateProjectCategory = (id, data, headers) =>
  socket.patch(`/project-categories/${id}`, data, headers);

const deleteProjectCategory = (id, headers) =>
  socket.delete(`/project-categories/${id}`, undefined, headers);

export default {
  getProjectCategories,
  createProjectCategory,
  getProjectCategory,
  updateProjectCategory,
  deleteProjectCategory,
};
