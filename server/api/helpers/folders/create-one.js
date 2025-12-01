/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    spaceId: {
      type: 'string',
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
    description: {
      type: 'string',
      allowNull: true,
    },
    parentFolderId: {
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
    let path = `/${inputs.name}`;
    if (inputs.parentFolderId) {
      const parentFolder = await DocumentFolder.findOne({ id: inputs.parentFolderId });
      if (parentFolder) {
        path = `${parentFolder.path}/${inputs.name}`;
      }
    }

    const folder = await DocumentFolder.create({
      name: inputs.name,
      description: inputs.description,
      space: inputs.spaceId,
      parentFolder: inputs.parentFolderId || null,
      path,
      createdByUser: inputs.user.id,
    }).fetch();

    sails.sockets.broadcast(`space:${inputs.spaceId}`, 'folderCreate', {
      item: folder,
    });

    await sails.helpers.documentActivity.logOne.with({
      user: inputs.user,
      action: 'create',
      resourceType: 'folder',
      resourceId: folder.id,
      resourceName: folder.name,
      spaceId: String(inputs.spaceId),
      request: inputs.request,
    });

    return folder;
  },
};
