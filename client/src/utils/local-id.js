/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

export const createLocalId = () => `local:${Date.now()}`;

export const isLocalId = (id) => typeof id === 'string' && id.startsWith('local:');
