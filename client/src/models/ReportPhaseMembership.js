/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'ReportPhaseMembership';

  static fields = {
    id: attr(),
    phaseId: fk({
      to: 'ReportPhase',
      as: 'phase',
      relatedName: 'memberships',
    }),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'phaseMemberships',
    }),
    permission: attr(),
    createdAt: attr(),
    updatedAt: attr(),
  };

  static reducer({ type, payload }, ReportPhaseMembership) {
    switch (type) {
      case ActionTypes.REPORTS_FETCH__SUCCESS:
        ReportPhaseMembership.all().delete();

        if (payload.reportPhaseMemberships) {
          payload.reportPhaseMemberships.forEach((membership) => {
            ReportPhaseMembership.upsert(membership);
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        ReportPhaseMembership.all().delete();

        if (payload.reportPhaseMemberships) {
          payload.reportPhaseMemberships.forEach((membership) => {
            ReportPhaseMembership.upsert(membership);
          });
        }

        break;
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.USER_UPDATE_HANDLE:
        if (payload.reportPhaseMemberships) {
          payload.reportPhaseMemberships.forEach((membership) => {
            ReportPhaseMembership.upsert(membership);
          });
        }

        break;
      case ActionTypes.REPORT_PHASE_CREATE:
      case ActionTypes.REPORT_PHASE_CREATE__SUCCESS:
      case ActionTypes.REPORT_PHASE_CREATE_HANDLE:
      case ActionTypes.REPORT_PHASE_UPDATE__SUCCESS:
      case ActionTypes.REPORT_PHASE_UPDATE_HANDLE:
        if (payload.reportPhaseMemberships) {
          ReportPhaseMembership.filter({ phaseId: payload.reportPhase.id }).delete();

          payload.reportPhaseMemberships.forEach((membership) => {
            ReportPhaseMembership.upsert(membership);
          });
        } else {
          console.log('🔴 [REDUCER] No reportPhaseMemberships in payload!');
        }

        break;
      case ActionTypes.REPORT_PHASE_DELETE:
        ReportPhaseMembership.filter({ phaseId: payload.id }).delete();
        break;
      case ActionTypes.REPORT_PHASE_DELETE__SUCCESS:
      case ActionTypes.REPORT_PHASE_DELETE_HANDLE:
        if (payload.reportPhase) {
          ReportPhaseMembership.filter({ phaseId: payload.reportPhase.id }).delete();
        }
        break;
      default:
    }
  }
}
