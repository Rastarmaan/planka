/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import actions from '../actions';
import api from '../api';
import { getAccessToken } from '../utils/access-token-storage';

const authorize = () => {
  const accessToken = getAccessToken();

  if (!accessToken) {
    return;
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };

  api
    .authorizeGoogleCalendar(headers)
    .then((response) => {
      if (response && response.item && response.item.authUrl) {
        window.location.href = response.item.authUrl;
      }
    })
    .catch(() => {
      // Error is already logged by API layer
    });
};

const fetchStatus = () => actions.fetchGoogleCalendarStatus();

const disconnect = () => actions.disconnectGoogleCalendar();

const toggle = (isEnabled) => actions.toggleGoogleCalendar(isEnabled);

const fetchCalendars = () => actions.fetchGoogleCalendars();

const updateCalendar = (calendarId) => actions.updateGoogleCalendar(calendarId);

export default {
  authorize,
  fetchStatus,
  disconnect,
  toggle,
  fetchCalendars,
  updateCalendar,
};
