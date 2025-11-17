/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

const authorizeGoogleCalendar = (headers) =>
  socket.get('/google/oauth/authorize', undefined, headers);

const getGoogleCalendarStatus = (headers) =>
  socket.get('/google-calendar/status', undefined, headers);

const disconnectGoogleCalendar = (headers) =>
  socket.post('/google-calendar/disconnect', undefined, headers);

const toggleGoogleCalendar = (data, headers) =>
  socket.patch('/google-calendar/toggle', data, headers);

const listGoogleCalendars = (headers) =>
  socket.get('/google-calendar/calendars', undefined, headers);

const updateGoogleCalendar = (data, headers) =>
  socket.patch('/google-calendar/calendar', data, headers);

export default {
  authorizeGoogleCalendar,
  getGoogleCalendarStatus,
  disconnectGoogleCalendar,
  toggleGoogleCalendar,
  listGoogleCalendars,
  updateGoogleCalendar,
};
