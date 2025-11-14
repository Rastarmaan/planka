/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import core from './core';
import boardReleases from './board-releases';
import boards from './boards';

export default {
  ...core,
  ...boards,
  ...boardReleases,
};
