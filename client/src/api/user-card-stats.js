/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import http from './http';
import { getAccessToken } from '../utils/access-token-storage';

const getUserCardStats = () => {
  const accessToken = getAccessToken();
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;

  return http.get('/user/card-stats', undefined, headers);
};

export default {
  getUserCardStats,
};
