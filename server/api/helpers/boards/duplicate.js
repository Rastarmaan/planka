/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  friendlyName: 'Boards / duplicate',

  description: 'Duplicate a board into a new board or into an existing project.',

  inputs: {
    sourceBoardId: { type: 'string', required: true },
    mode: { type: 'string', isIn: ['new', 'existing'], required: true },
    targetProjectId: { type: 'string' },
    name: { type: 'string' },
    includeArchived: { type: 'boolean' },
    userId: { type: 'string', required: true },
    requestId: { type: 'string' },
  },

  exits: {},

  async fn(inputs) {
    const source = await Board.findOne({ id: inputs.sourceBoardId });
    if (!source) {
      throw new Error('Source board not found');
    }

    const targetProjectId =
      inputs.mode === 'existing' && inputs.targetProjectId
        ? inputs.targetProjectId
        : source.projectId;

    const max = await Board.find({ projectId: targetProjectId }).sort('position DESC').limit(1);
    const nextPosition = (max[0] && max[0].position + 65536) || 65536;

    const name = inputs.name || `${source.name} (Copy)`;

    const created = await Board.create({
      projectId: targetProjectId,
      position: nextPosition,
      name,
      defaultView: source.defaultView,
      defaultCardType: source.defaultCardType,
      limitCardTypesToDefaultOne: source.limitCardTypesToDefaultOne,
      alwaysDisplayCardCreator: source.alwaysDisplayCardCreator,
      expandTaskListsByDefault: source.expandTaskListsByDefault,
    }).fetch();

    return { board: created };
  },
};
