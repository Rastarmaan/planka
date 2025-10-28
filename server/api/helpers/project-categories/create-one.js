/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
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

    const projectCategory = await ProjectCategory.create(values).fetch();

    sails.sockets.broadcast(
      'user',
      'projectCategoryCreate',
      {
        item: projectCategory,
      },
      inputs.request,
    );

    return projectCategory;
  },
};
