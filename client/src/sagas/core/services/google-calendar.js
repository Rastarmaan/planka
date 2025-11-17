/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import request from '../request';

export function* authorizeGoogleCalendar() {
  yield call(api.authorizeGoogleCalendar);
}

export function* fetchGoogleCalendarStatus() {
  let status;
  try {
    ({ item: status } = yield call(request, api.getGoogleCalendarStatus));
  } catch (error) {
    yield put(actions.fetchGoogleCalendarStatus.failure(error));
    return;
  }

  yield put(actions.fetchGoogleCalendarStatus.success(status));
}

export function* disconnectGoogleCalendar() {
  try {
    yield call(request, api.disconnectGoogleCalendar);
    yield put(actions.disconnectGoogleCalendar.success());
    yield call(fetchGoogleCalendarStatus);
  } catch (error) {
    yield put(actions.disconnectGoogleCalendar.failure(error));
  }
}

export function* toggleGoogleCalendar({ payload: { isEnabled } }) {
  let status;
  try {
    ({ item: status } = yield call(request, api.toggleGoogleCalendar, { isEnabled }));
  } catch (error) {
    yield put(actions.toggleGoogleCalendar.failure(error));
    return;
  }

  yield put(actions.toggleGoogleCalendar.success(status));
}

export function* fetchGoogleCalendars() {
  let calendars;
  try {
    ({ item: calendars } = yield call(request, api.listGoogleCalendars));
  } catch (error) {
    yield put(actions.fetchGoogleCalendars.failure(error));
    return;
  }

  yield put(actions.fetchGoogleCalendars.success(calendars));
}

export function* updateGoogleCalendar({ payload: { calendarId } }) {
  let result;
  try {
    ({ item: result } = yield call(request, api.updateGoogleCalendar, { calendarId }));
    yield put(actions.updateGoogleCalendar.success(result.calendarId));
    yield call(fetchGoogleCalendarStatus);
  } catch (error) {
    yield put(actions.updateGoogleCalendar.failure(error));
  }
}

export default {
  authorizeGoogleCalendar,
  fetchGoogleCalendarStatus,
  disconnectGoogleCalendar,
  toggleGoogleCalendar,
  fetchGoogleCalendars,
  updateGoogleCalendar,
};
