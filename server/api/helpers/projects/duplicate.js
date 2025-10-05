/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  friendlyName: 'Projects / duplicate',

  description: 'Duplicate a project as a new project or merge into an existing project.',

  inputs: {
    sourceProjectId: { type: 'string', required: true },
    mode: { type: 'string', isIn: ['new', 'existing'], required: true },
    targetProjectId: { type: 'string' },
    name: { type: 'string' },
    includeArchived: { type: 'boolean' },
    userId: { type: 'string', required: true },
    requestId: { type: 'string' },
  },

  exits: {},

  async fn(inputs) {
    const source = await Project.findOne({ id: inputs.sourceProjectId });
    if (!source) {
      throw new Error('Source project not found');
    }

    const name = inputs.name || `${source.name} (Copy)`;

    if (inputs.mode === 'existing' && inputs.targetProjectId) {
      const target = await Project.findOne({ id: inputs.targetProjectId });
      if (!target) {
        throw new Error('Target project not found');
      }
      return { project: target };
    }

    const created = await Project.create({
      name,
      isHidden: false,
    }).fetch();

    return { project: created };
  },
};
