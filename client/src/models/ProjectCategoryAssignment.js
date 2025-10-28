/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'ProjectCategoryAssignment';

  static fields = {
    id: attr(),
    projectId: fk({
      to: 'Project',
      relatedName: 'categoryAssignments',
    }),
    categoryId: fk({
      to: 'ProjectCategory',
      relatedName: 'projectAssignments',
    }),
  };

  static reducer({ type, payload }, ProjectCategoryAssignment) {
    switch (type) {
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.PROJECT_CREATE__SUCCESS:
      case ActionTypes.PROJECT_CREATE_HANDLE:
        if (payload.projectCategoryAssignments) {
          // eslint-disable-next-line no-console
          console.log(
            '[ProjectCategoryAssignment] Upserting assignments:',
            payload.projectCategoryAssignments,
          );
          payload.projectCategoryAssignments.forEach((assignment) => {
            ProjectCategoryAssignment.upsert(assignment);
          });
        }
        break;
      case ActionTypes.PROJECT_CATEGORY_ASSIGNMENTS_HANDLE:
        // Delete existing assignments for this project
        ProjectCategoryAssignment.filter(
          (assignment) => assignment.projectId === payload.projectId,
        ).delete();

        // Add new assignments
        if (payload.projectCategoryAssignments) {
          payload.projectCategoryAssignments.forEach((assignment) => {
            ProjectCategoryAssignment.upsert(assignment);
          });
        }
        break;
      default:
    }
  }
}
