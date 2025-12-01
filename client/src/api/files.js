/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import http from './http';
import socket from './socket';

const uploadFile = (spaceId, formData, folderId, headers) => {
  const url = folderId
    ? `/spaces/${spaceId}/upload?folderId=${folderId}`
    : `/spaces/${spaceId}/upload`;
  return http.post(url, formData, headers);
};

const getFile = (id, headers) => socket.get(`/files/${id}`, undefined, headers);

const updateFile = (id, data, headers) => socket.patch(`/files/${id}`, data, headers);

const deleteFile = (id, headers) => socket.delete(`/files/${id}`, undefined, headers);

const downloadFile = (id, headers) =>
  http.get(`/files/${id}/download`, { responseType: 'blob', ...headers });

export default {
  uploadFile,
  getFile,
  updateFile,
  deleteFile,
  downloadFile,
};
