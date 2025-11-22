/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Helper to check if a user has specific permission for a resource
 */

module.exports = {
  inputs: {
    userId: {
      type: 'string',
      required: true,
    },
    resourceType: {
      type: 'string',
      required: true,
      isIn: ['space', 'folder', 'file'],
    },
    resourceId: {
      type: 'string',
      required: true,
    },
    permissionType: {
      type: 'string',
      required: true,
      isIn: ['canView', 'canDownload', 'canEdit', 'canDelete', 'canShare'],
    },
  },

  async fn(inputs) {
    const permission = await DocumentPermission.findOne({
      resourceType: inputs.resourceType,
      resourceId: inputs.resourceId,
      user: inputs.userId,
    });

    if (permission && permission[inputs.permissionType]) {
      return true;
    }

    if (inputs.resourceType === 'file' || inputs.resourceType === 'folder') {
      return this.checkParentPermission(inputs);
    }

    return false;
  },

  async checkParentPermission(inputs) {
    let parentType;
    let parentId;

    if (inputs.resourceType === 'file') {
      const file = await DocumentFile.findOne({ id: inputs.resourceId });
      if (!file) return false;

      if (file.folder) {
        parentType = 'folder';
        parentId = file.folder;
      } else {
        parentType = 'space';
        parentId = file.spaceId;
      }
    } else if (inputs.resourceType === 'folder') {
      const folder = await DocumentFolder.findOne({ id: inputs.resourceId });
      if (!folder) return false;

      if (folder.parentFolder) {
        parentType = 'folder';
        parentId = folder.parentFolder;
      } else {
        parentType = 'space';
        parentId = folder.spaceId;
      }
    }

    if (!parentId) return false;

    const parentPermission = await DocumentPermission.findOne({
      resourceType: parentType,
      resourceId: parentId,
      user: inputs.userId,
    });

    if (
      parentPermission &&
      parentPermission.inheritFromParent &&
      parentPermission[inputs.permissionType]
    ) {
      return true;
    }

    if (parentType === 'folder') {
      return this.checkParentPermission({
        userId: inputs.userId,
        resourceType: parentType,
        resourceId: parentId,
        permissionType: inputs.permissionType,
      });
    }

    return false;
  },
};
