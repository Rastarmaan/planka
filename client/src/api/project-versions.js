/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const getProjectVersions = (projectId, headers, params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.limit) queryParams.append('limit', params.limit);
  if (params.offset) queryParams.append('offset', params.offset);

  const queryString = queryParams.toString();
  const url = `/projects/${projectId}/versions${queryString ? `?${queryString}` : ''}`;

  return socket.get(url, undefined, headers);
};

const createProjectVersion = (projectId, data, requestId, headers) => {
  const url = `/projects/${projectId}/versions${requestId ? `?requestId=${requestId}` : ''}`;
  return socket.post(url, data, headers);
};

const deleteProjectVersion = (projectId, versionId, requestId, headers) => {
  const url = `/projects/${projectId}/versions/${versionId}${requestId ? `?requestId=${requestId}` : ''}`;
  return socket.delete(url, undefined, headers);
};

const restoreProjectVersion = (projectId, versionId, requestId, headers, data = {}) => {
  const url = `/projects/${projectId}/versions/${versionId}/restore${requestId ? `?requestId=${requestId}` : ''}`;
  return socket.post(url, data, headers);
};

export default {
  getProjectVersions,
  createProjectVersion,
  deleteProjectVersion,
  restoreProjectVersion,
};
