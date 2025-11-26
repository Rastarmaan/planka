/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    name: {
      type: 'string',
      required: true,
    },
    description: {
      type: 'string',
      allowNull: true,
    },
    color: {
      type: 'string',
      allowNull: true,
    },
    user: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const space = await Space.create({
      name: inputs.name,
      description: inputs.description,
      color: inputs.color,
      createdByUser: inputs.user.id,
    }).fetch();

    sails.sockets.broadcast('admins', 'spaceCreate', {
      item: space,
    });

    await sails.helpers.documentActivity.logOne.with({
      user: inputs.user,
      action: 'create',
      resourceType: 'space',
      resourceId: space.id,
      resourceName: space.name,
      spaceId: String(space.id),
      request: inputs.request,
    });

    return space;
  },
};
