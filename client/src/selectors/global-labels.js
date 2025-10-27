/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';

export const selectGlobalLabels = createSelector(orm, ({ Label }) => {
  return Label.filter((label) => label.isGlobal === true)
    .orderBy('position')
    .toRefArray();
});

export default {
  selectGlobalLabels,
};
