/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

const fetchProjectStats = (projectId, headers) =>
  socket.get(`/projects/${projectId}/stats`, undefined, headers);

export default {
  fetchProjectStats,
};
