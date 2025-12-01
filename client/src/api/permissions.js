/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

const createPermission = (data, headers) => socket.post('/permissions', data, headers);

const getPermissions = (params, headers) => socket.get('/permissions', params, headers);

const getMyPermissions = (headers) => socket.get('/permissions/my', undefined, headers);

const deletePermission = (id, headers) => socket.delete(`/permissions/${id}`, undefined, headers);

export default {
  createPermission,
  getPermissions,
  getMyPermissions,
  deletePermission,
};
