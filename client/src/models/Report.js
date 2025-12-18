/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'Report';

  static fields = {
    id: attr(),
    name: attr(),
    createdAt: attr(),
    updatedAt: attr(),
  };

  static reducer({ type, payload }, Report) {
    switch (type) {
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        Report.all().delete();

        if (payload.reports) {
          payload.reports.forEach((report) => {
            Report.upsert(report);
          });
        }

        break;
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.USER_UPDATE_HANDLE:
        if (payload.reports) {
          payload.reports.forEach((report) => {
            Report.upsert(report);
          });
        }

        break;
      case ActionTypes.REPORTS_FETCH__SUCCESS:
        if (payload.reports) {
          payload.reports.forEach((report) => {
            Report.upsert(report);
          });
        }

        break;
      case ActionTypes.REPORT_CREATE:
      case ActionTypes.REPORT_CREATE_HANDLE:
      case ActionTypes.REPORT_UPDATE__SUCCESS:
      case ActionTypes.REPORT_UPDATE_HANDLE:
        Report.upsert(payload.report);

        break;
      case ActionTypes.REPORT_CREATE__SUCCESS:
        Report.withId(payload.localId).delete();
        Report.upsert(payload.report);

        break;
      case ActionTypes.REPORT_DELETE:
        if (Report.idExists(payload.id)) {
          Report.withId(payload.id).deleteWithRelated();
        }

        break;
      case ActionTypes.REPORT_DELETE__SUCCESS:
      case ActionTypes.REPORT_DELETE_HANDLE:
        if (payload.report && Report.idExists(payload.report.id)) {
          Report.withId(payload.report.id).deleteWithRelated();
        }

        break;
      default:
    }
  }

  deleteWithRelated() {
    this.reportPhases.toModelArray().forEach((phase) => {
      phase.delete();
    });

    this.delete();
  }
}
