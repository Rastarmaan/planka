/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

const getDocumentActivities = (params, headers) =>
  socket.get('/document-activities', params, headers);

export default {
  getDocumentActivities,
};
