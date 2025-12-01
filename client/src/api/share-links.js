/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

const createShareLink = (data, headers) => socket.post('/share-links', data, headers);

const getShareLinks = (resourceType, resourceId, headers) =>
  socket.get(
    `/share-links?resourceType=${resourceType}&resourceId=${resourceId}`,
    undefined,
    headers,
  );

const updateShareLink = (id, data, headers) => socket.patch(`/share-links/${id}`, data, headers);

const deleteShareLink = (id, headers) => socket.delete(`/share-links/${id}`, undefined, headers);

export default {
  createShareLink,
  getShareLinks,
  updateShareLink,
  deleteShareLink,
};
