/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Actions */

const getBoardVersions = (boardId, headers, params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.limit) queryParams.append('limit', params.limit);
  if (params.offset) queryParams.append('offset', params.offset);

  const queryString = queryParams.toString();
  const url = `/boards/${boardId}/versions${queryString ? `?${queryString}` : ''}`;

  return socket.get(url, undefined, headers);
};

const createBoardVersion = (boardId, data, requestId, headers) => {
  const url = `/boards/${boardId}/versions${requestId ? `?requestId=${requestId}` : ''}`;
  return socket.post(url, data, headers);
};

const deleteBoardVersion = (boardId, versionId, requestId, headers) => {
  const url = `/boards/${boardId}/versions/${versionId}${requestId ? `?requestId=${requestId}` : ''}`;
  return socket.delete(url, undefined, headers);
};

const restoreBoardVersion = (boardId, versionId, requestId, headers, data = {}) => {
  const url = `/boards/${boardId}/versions/${versionId}/restore${requestId ? `?requestId=${requestId}` : ''}`;
  return socket.post(url, data, headers);
};

export default {
  getBoardVersions,
  createBoardVersion,
  deleteBoardVersion,
  restoreBoardVersion,
};
