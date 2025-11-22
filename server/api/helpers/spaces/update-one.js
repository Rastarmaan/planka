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
    user: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { record, values } = inputs;

    const updatedSpace = await Space.updateOne({ id: record.id }).set(
      _.pick(values, ['name', 'description', 'color']),
    );

    if (!updatedSpace) {
      throw new Error('Space not found');
    }

    sails.sockets.broadcast('admins', 'spaceUpdate', {
      item: updatedSpace,
    });

    await sails.helpers.documentActivity.logOne.with({
      user: inputs.user,
      action: 'update',
      resourceType: 'space',
      resourceId: updatedSpace.id,
      resourceName: updatedSpace.name,
      metadata: {
        changes: values,
      },
      request: inputs.request,
    });

    return updatedSpace;
  },
};
