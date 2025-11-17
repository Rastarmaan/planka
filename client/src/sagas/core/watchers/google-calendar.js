/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { takeEvery } from 'redux-saga/effects';

import ActionTypes from '../../../constants/ActionTypes';
import services from '../services';

export default function* googleCalendarWatchers() {
  // GOOGLE_CALENDAR_AUTHORIZE is handled directly in component (redirect), no saga needed
  yield takeEvery(ActionTypes.GOOGLE_CALENDAR_STATUS_FETCH, services.fetchGoogleCalendarStatus);
  yield takeEvery(ActionTypes.GOOGLE_CALENDAR_DISCONNECT, services.disconnectGoogleCalendar);
  yield takeEvery(ActionTypes.GOOGLE_CALENDAR_TOGGLE, services.toggleGoogleCalendar);
  yield takeEvery(ActionTypes.GOOGLE_CALENDAR_CALENDARS_FETCH, services.fetchGoogleCalendars);
  yield takeEvery(ActionTypes.GOOGLE_CALENDAR_CALENDAR_UPDATE, services.updateGoogleCalendar);
}
