/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';

export const makeSelectSpaces = () => createSelector(orm, ({ Space }) => Space.all().toRefArray());

export const makeSelectSpaceById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Space }, id) => {
      const spaceModel = Space.withId(id);

      if (!spaceModel) {
        return spaceModel;
      }

      return spaceModel.ref;
    },
  );

export default {
  makeSelectSpaces,
  makeSelectSpaceById,
};
