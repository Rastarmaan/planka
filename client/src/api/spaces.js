/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

const createSpace = (data, headers) => socket.post('/spaces', data, headers);

const getSpaces = (headers) => socket.get('/spaces', undefined, headers);

const getSpace = (id, headers) => socket.get(`/spaces/${id}`, undefined, headers);

const updateSpace = (id, data, headers) => socket.patch(`/spaces/${id}`, data, headers);

const deleteSpace = (id, headers) => socket.delete(`/spaces/${id}`, undefined, headers);

export default {
  createSpace,
  getSpaces,
  getSpace,
  updateSpace,
  deleteSpace,
};
