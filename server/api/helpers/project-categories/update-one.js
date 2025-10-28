/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      required: true,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values } = inputs;

    const projectCategory = await ProjectCategory.updateOne(inputs.record.id).set(values);

    if (!projectCategory) {
      return projectCategory;
    }

    sails.sockets.broadcast(
      'user',
      'projectCategoryUpdate',
      {
        item: projectCategory,
      },
      inputs.request,
    );

    return projectCategory;
  },
};
