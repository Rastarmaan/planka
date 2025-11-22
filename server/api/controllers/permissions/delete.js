/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /permissions/{id}:
 *   delete:
 *     summary: Revoke permission
 *     description: Remove user permission from resource
 *     tags:
 *       - Permissions
 */

module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
      regex: /^\d+$/,
    },
  },

  async fn(inputs) {
    const permission = await DocumentPermission.findOne({ id: inputs.id });

    if (!permission) {
      throw 'notFound';
    }

    let spaceId;
    if (permission.resourceType === 'space') {
      spaceId = permission.resourceId;
    } else if (permission.resourceType === 'folder') {
      const folder = await DocumentFolder.findOne({ id: permission.resourceId });
      spaceId = folder ? folder.space : null;
    } else if (permission.resourceType === 'file') {
      const file = await DocumentFile.findOne({ id: permission.resourceId });
      spaceId = file ? file.space : null;
    }

    await DocumentPermission.destroyOne({ id: permission.id });

    if (spaceId) {
      sails.sockets.broadcast(`space:${spaceId}`, 'permissionDelete', {
        item: {
          id: permission.id,
        },
      });
    }

    return {
      item: permission,
    };
  },
};
