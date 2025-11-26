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

    await DocumentFile.updateOne({ id: record.id }).set({
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedByUser: inputs.user.id,
    });

    sails.sockets.broadcast(`space:${record.space}`, 'fileDelete', {
      item: {
        id: record.id,
      },
    });

    await sails.helpers.documentActivity.logOne.with({
      user: inputs.user,
      action: 'delete',
      resourceType: 'file',
      resourceId: record.id,
      resourceName: record.name,
      spaceId: String(record.space),
      request: inputs.request,
    });

    return record;
  },
};
