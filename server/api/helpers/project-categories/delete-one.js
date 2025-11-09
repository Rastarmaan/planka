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
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const projectCategory = await ProjectCategory.destroyOne(inputs.record.id);

    if (!projectCategory) {
      return projectCategory;
    }

    // Delete all assignments
    await ProjectCategoryAssignment.destroy({
      categoryId: projectCategory.id,
    });

    sails.sockets.broadcast(
      'user',
      'projectCategoryDelete',
      {
        item: projectCategory,
      },
      inputs.request,
    );

    return projectCategory;
  },
};
