/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';

export const makeSelectPermissionsByResourceId = () =>
  createSelector(
    orm,
    (_, resourceType, resourceId) => ({ resourceType, resourceId }),
    ({ Permission }, { resourceType, resourceId }) => {
      if (!resourceType || !resourceId) {
        return [];
      }

      return Permission.filter({ resourceType, resourceId }).toRefArray();
    },
  );

export default {
  makeSelectPermissionsByResourceId,
};
