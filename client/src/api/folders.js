/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

const createFolder = (spaceId, data, headers) =>
  socket.post(`/spaces/${spaceId}/folders`, data, headers);

const createSubFolder = (folderId, data, headers) =>
  socket.post(`/folders/${folderId}/folders`, data, headers);

const getFolders = (spaceId, headers) =>
  socket.get(`/spaces/${spaceId}/folders`, undefined, headers);

const getFolder = (id, headers) => socket.get(`/folders/${id}`, undefined, headers);

const updateFolder = (id, data, headers) => socket.patch(`/folders/${id}`, data, headers);

const deleteFolder = (id, headers) => socket.delete(`/folders/${id}`, undefined, headers);

export default {
  createFolder,
  createSubFolder,
  getFolders,
  getFolder,
  updateFolder,
  deleteFolder,
};
