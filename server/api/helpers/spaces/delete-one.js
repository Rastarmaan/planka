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
    user: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { record } = inputs;

    const deletedSpace = await Space.updateOne({ id: record.id }).set({
      isDeleted: true,
      deletedAt: new Date().toISOString(),
    });

    if (!deletedSpace) {
      throw new Error('Space not found');
    }

    await DocumentFolder.update({ space: record.id, isDeleted: false }).set({
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedByUser: inputs.user.id,
    });

    await DocumentFile.update({ space: record.id, isDeleted: false }).set({
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedByUser: inputs.user.id,
    });

    sails.sockets.broadcast('admins', 'spaceDelete', {
      item: {
        id: deletedSpace.id,
      },
    });

    await sails.helpers.documentActivity.logOne.with({
      user: inputs.user,
      action: 'delete',
      resourceType: 'space',
      resourceId: deletedSpace.id,
      resourceName: deletedSpace.name,
      spaceId: String(deletedSpace.id),
      request: inputs.request,
    });

    return deletedSpace;
  },
};
