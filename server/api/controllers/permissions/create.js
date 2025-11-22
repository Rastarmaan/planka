/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /permissions:
 *   post:
 *     summary: Grant permission
 *     description: Grant a user permission to a resource
 *     tags:
 *       - Permissions
 */

module.exports = {
  inputs: {
    resourceType: {
      type: 'string',
      required: true,
      isIn: Object.values(DocumentPermission.ResourceTypes),
    },
    resourceId: {
      type: 'string',
      required: true,
      regex: /^\d+$/,
    },
    userId: {
      type: 'string',
      required: true,
      regex: /^\d+$/,
    },
    canView: {
      type: 'boolean',
      defaultsTo: true,
    },
    canDownload: {
      type: 'boolean',
      defaultsTo: false,
    },
    canEdit: {
      type: 'boolean',
      defaultsTo: false,
    },
    canDelete: {
      type: 'boolean',
      defaultsTo: false,
    },
    canShare: {
      type: 'boolean',
      defaultsTo: false,
    },
    inheritFromParent: {
      type: 'boolean',
      defaultsTo: true,
    },
  },

  async fn(inputs) {
    const user = await User.findOne({ id: inputs.userId });
    if (!user) {
      throw 'notFound';
    }

    let resource;
    switch (inputs.resourceType) {
      case DocumentPermission.ResourceTypes.SPACE:
        resource = await Space.findOne({ id: inputs.resourceId, isDeleted: false });
        break;
      case DocumentPermission.ResourceTypes.FOLDER:
        resource = await DocumentFolder.findOne({ id: inputs.resourceId, isDeleted: false });
        break;
      case DocumentPermission.ResourceTypes.FILE:
        resource = await DocumentFile.findOne({ id: inputs.resourceId, isDeleted: false });
        break;
      default:
        throw 'badRequest';
    }

    if (!resource) {
      throw 'notFound';
    }

    const existingPermission = await DocumentPermission.findOne({
      resourceType: inputs.resourceType,
      resourceId: inputs.resourceId,
      user: inputs.userId,
    });

    let permission;
    if (existingPermission) {
      permission = await DocumentPermission.updateOne({ id: existingPermission.id }).set({
        canView: inputs.canView,
        canDownload: inputs.canDownload,
        canEdit: inputs.canEdit,
        canDelete: inputs.canDelete,
        canShare: inputs.canShare,
        inheritFromParent: inputs.inheritFromParent,
      });
    } else {
      permission = await DocumentPermission.create({
        resourceType: inputs.resourceType,
        resourceId: inputs.resourceId,
        user: inputs.userId,
        canView: inputs.canView,
        canDownload: inputs.canDownload,
        canEdit: inputs.canEdit,
        canDelete: inputs.canDelete,
        canShare: inputs.canShare,
        inheritFromParent: inputs.inheritFromParent,
        grantedByUser: this.req.currentUser.id,
      }).fetch();
    }

    let spaceId;
    if (inputs.resourceType === 'space') {
      spaceId = inputs.resourceId;
    } else if (inputs.resourceType === 'folder') {
      const folder = await DocumentFolder.findOne({ id: inputs.resourceId });
      spaceId = folder ? folder.space : null;
    } else if (inputs.resourceType === 'file') {
      const file = await DocumentFile.findOne({ id: inputs.resourceId });
      spaceId = file ? file.space : null;
    }

    if (spaceId) {
      sails.sockets.broadcast(`space:${spaceId}`, 'permissionCreate', {
        item: permission,
      });
    }

    await sails.helpers.documentActivity.logOne.with({
      user: this.req.currentUser,
      action: 'share',
      resourceType: inputs.resourceType,
      resourceId: inputs.resourceId,
      resourceName: resource.name,
      metadata: {
        permissionId: permission.id,
        targetUserId: inputs.userId,
        permissions: _.pick(inputs, ['canView', 'canDownload', 'canEdit', 'canDelete', 'canShare']),
      },
      request: this.req,
    });

    return {
      item: permission,
    };
  },
};
