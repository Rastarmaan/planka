/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'ReportPhase';

  static fields = {
    id: attr(),
    reportId: fk({
      to: 'Report',
      as: 'report',
      relatedName: 'reportPhases',
    }),
    name: attr(),
    description: attr(),
    startDate: attr(),
    endDate: attr(),
    status: attr(),
    position: attr(),
    createdAt: attr(),
    updatedAt: attr(),
  };

  static reducer({ type, payload }, ReportPhase) {
    switch (type) {
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        ReportPhase.all().delete();

        if (payload.reportPhases) {
          payload.reportPhases.forEach((phase) => {
            ReportPhase.upsert(phase);
          });
        }

        break;
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.USER_UPDATE_HANDLE:
      case ActionTypes.REPORT_CREATE_HANDLE:
        if (payload.reportPhases) {
          payload.reportPhases.forEach((phase) => {
            ReportPhase.upsert(phase);
          });
        }

        break;
      case ActionTypes.REPORT_PHASE_CREATE:
      case ActionTypes.REPORT_PHASE_CREATE_HANDLE:
      case ActionTypes.REPORT_PHASE_UPDATE__SUCCESS:
      case ActionTypes.REPORT_PHASE_UPDATE_HANDLE:
        ReportPhase.upsert(payload.reportPhase);

        break;
      case ActionTypes.REPORT_PHASE_CREATE__SUCCESS:
        ReportPhase.withId(payload.localId).delete();
        ReportPhase.upsert(payload.reportPhase);

        break;
      case ActionTypes.REPORT_PHASE_DELETE:
        if (ReportPhase.idExists(payload.id)) {
          ReportPhase.withId(payload.id).deleteWithRelated();
        }

        break;
      case ActionTypes.REPORT_PHASE_DELETE__SUCCESS:
      case ActionTypes.REPORT_PHASE_DELETE_HANDLE:
        if (payload.reportPhase && ReportPhase.idExists(payload.reportPhase.id)) {
          ReportPhase.withId(payload.reportPhase.id).deleteWithRelated();
        }

        break;
      default:
    }
  }

  deleteWithRelated() {
    this.delete();
  }
}
