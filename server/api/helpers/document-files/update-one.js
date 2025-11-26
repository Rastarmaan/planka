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
    const updateData = {};

    if (values.name !== undefined) {
      updateData.name = values.name;
    }

    if (values.folderId !== undefined) {
      updateData.folder = values.folderId || null;
    }

    const updatedFile = await DocumentFile.updateOne({ id: record.id }).set(updateData);

    if (!updatedFile) {
      throw new Error('File not found');
    }

    sails.sockets.broadcast(`space:${record.space}`, 'fileUpdate', {
      item: updatedFile,
    });

    await sails.helpers.documentActivity.logOne.with({
      user: inputs.user,
      action: 'update',
      resourceType: 'file',
      resourceId: updatedFile.id,
      resourceName: updatedFile.name,
      spaceId: String(record.space),
      metadata: {
        changes: values,
      },
      request: inputs.request,
    });

    return updatedFile;
  },
};
