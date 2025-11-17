/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const authorizeGoogleCalendar = () => ({
  type: ActionTypes.GOOGLE_CALENDAR_AUTHORIZE,
  payload: {},
});

const fetchGoogleCalendarStatus = () => ({
  type: ActionTypes.GOOGLE_CALENDAR_STATUS_FETCH,
  payload: {},
});

fetchGoogleCalendarStatus.success = (status) => ({
  type: ActionTypes.GOOGLE_CALENDAR_STATUS_FETCH__SUCCESS,
  payload: {
    status,
  },
});

fetchGoogleCalendarStatus.failure = (error) => ({
  type: ActionTypes.GOOGLE_CALENDAR_STATUS_FETCH__FAILURE,
  payload: {
    error,
  },
});

const disconnectGoogleCalendar = () => ({
  type: ActionTypes.GOOGLE_CALENDAR_DISCONNECT,
  payload: {},
});

disconnectGoogleCalendar.success = () => ({
  type: ActionTypes.GOOGLE_CALENDAR_DISCONNECT__SUCCESS,
  payload: {},
});

disconnectGoogleCalendar.failure = (error) => ({
  type: ActionTypes.GOOGLE_CALENDAR_DISCONNECT__FAILURE,
  payload: {
    error,
  },
});

const toggleGoogleCalendar = (isEnabled) => ({
  type: ActionTypes.GOOGLE_CALENDAR_TOGGLE,
  payload: {
    isEnabled,
  },
});

toggleGoogleCalendar.success = (status) => ({
  type: ActionTypes.GOOGLE_CALENDAR_TOGGLE__SUCCESS,
  payload: {
    status,
  },
});

toggleGoogleCalendar.failure = (error) => ({
  type: ActionTypes.GOOGLE_CALENDAR_TOGGLE__FAILURE,
  payload: {
    error,
  },
});

const fetchGoogleCalendars = () => ({
  type: ActionTypes.GOOGLE_CALENDAR_CALENDARS_FETCH,
  payload: {},
});

fetchGoogleCalendars.success = (calendars) => ({
  type: ActionTypes.GOOGLE_CALENDAR_CALENDARS_FETCH__SUCCESS,
  payload: {
    calendars,
  },
});

fetchGoogleCalendars.failure = (error) => ({
  type: ActionTypes.GOOGLE_CALENDAR_CALENDARS_FETCH__FAILURE,
  payload: {
    error,
  },
});

const updateGoogleCalendar = (calendarId) => ({
  type: ActionTypes.GOOGLE_CALENDAR_CALENDAR_UPDATE,
  payload: {
    calendarId,
  },
});

updateGoogleCalendar.success = (calendarId) => ({
  type: ActionTypes.GOOGLE_CALENDAR_CALENDAR_UPDATE__SUCCESS,
  payload: {
    calendarId,
  },
});

updateGoogleCalendar.failure = (error) => ({
  type: ActionTypes.GOOGLE_CALENDAR_CALENDAR_UPDATE__FAILURE,
  payload: {
    error,
  },
});

export default {
  authorizeGoogleCalendar,
  fetchGoogleCalendarStatus,
  disconnectGoogleCalendar,
  toggleGoogleCalendar,
  fetchGoogleCalendars,
  updateGoogleCalendar,
};
