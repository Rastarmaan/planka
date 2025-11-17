/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const initialState = {
  status: null,
  calendars: null,
  isFetching: false,
  isFetchingCalendars: false,
};

export default (state = initialState, action = {}) => {
  const { type, payload } = action;
  switch (type) {
    case ActionTypes.GOOGLE_CALENDAR_STATUS_FETCH:
      return {
        ...state,
        isFetching: true,
      };
    case ActionTypes.GOOGLE_CALENDAR_STATUS_FETCH__SUCCESS:
      return {
        ...state,
        status: payload.status,
        isFetching: false,
      };
    case ActionTypes.GOOGLE_CALENDAR_STATUS_FETCH__FAILURE:
      return {
        ...state,
        isFetching: false,
      };
    case ActionTypes.GOOGLE_CALENDAR_DISCONNECT__SUCCESS:
      return {
        ...state,
        status: {
          isConnected: false,
          isEnabled: false,
        },
      };
    case ActionTypes.GOOGLE_CALENDAR_TOGGLE__SUCCESS:
      return {
        ...state,
        status: payload.status,
      };
    case ActionTypes.GOOGLE_CALENDAR_CALENDARS_FETCH:
      return {
        ...state,
        isFetchingCalendars: true,
      };
    case ActionTypes.GOOGLE_CALENDAR_CALENDARS_FETCH__SUCCESS:
      return {
        ...state,
        calendars: payload.calendars,
        isFetchingCalendars: false,
      };
    case ActionTypes.GOOGLE_CALENDAR_CALENDARS_FETCH__FAILURE:
      return {
        ...state,
        isFetchingCalendars: false,
      };
    case ActionTypes.GOOGLE_CALENDAR_CALENDAR_UPDATE__SUCCESS:
      return {
        ...state,
        status: {
          ...state.status,
          calendarId: payload.calendarId,
        },
      };
    default:
      return state;
  }
};
