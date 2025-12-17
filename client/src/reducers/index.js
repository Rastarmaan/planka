/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { combineReducers } from 'redux';

import auth from './auth';
import common from './common';
import core from './core';
import documentActivities from './document-activities';
import googleCalendar from './google-calendar';
import orm from './orm';
import router from './router';
import socket from './socket';
import ui from './ui';
import projectStats from './projectStats';

export default combineReducers({
  router,
  socket,
  orm,
  common,
  auth,
  core,
  ui,
  googleCalendar,
  documentActivities,
  projectStats,
});
