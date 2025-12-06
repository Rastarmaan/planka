/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Helper to check if a user has specific permission for a resource
 */

async function getUserTeamIds(userId) {
  const teamMemberships = await TeamMembership.find({ user: userId });
  return teamMemberships.map((tm) => tm.team);
}

async function checkParentPermission(inputs, teamIds = []) {
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
      parentId = file.space;
    }
  } else if (inputs.resourceType === 'folder') {
    const folder = await DocumentFolder.findOne({ id: inputs.resourceId });
    if (!folder) return false;

    if (folder.parentFolder) {
      parentType = 'folder';
      parentId = folder.parentFolder;
    } else {
      parentType = 'space';
      parentId = folder.space;
    }
  }

  if (!parentId) return false;

  const parentPermission = await DocumentPermission.findOne({
    resourceType: parentType,
    resourceId: String(parentId),
    user: inputs.userId,
  });

  if (parentPermission && parentPermission[inputs.permissionType]) {
    return true;
  }

  if (teamIds.length > 0) {
    const teamPermissions = await DocumentPermission.find({
      resourceType: parentType,
      resourceId: String(parentId),
      team: teamIds,
    });

    const hasTeamPermission = teamPermissions.some((tp) => tp[inputs.permissionType]);
    if (hasTeamPermission) {
      return true;
    }
  }

  if (parentType === 'folder') {
    return checkParentPermission(
      {
        userId: inputs.userId,
        resourceType: parentType,
        resourceId: String(parentId),
        permissionType: inputs.permissionType,
      },
      teamIds,
    );
  }

  return false;
}

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

    const teamIds = await getUserTeamIds(inputs.userId);

    if (teamIds.length > 0) {
      const teamPermissions = await DocumentPermission.find({
        resourceType: inputs.resourceType,
        resourceId: inputs.resourceId,
        team: teamIds,
      });

      const hasTeamPermission = teamPermissions.some((tp) => tp[inputs.permissionType]);
      if (hasTeamPermission) {
        return true;
      }
    }

    if (inputs.resourceType === 'file' || inputs.resourceType === 'folder') {
      return checkParentPermission(inputs, teamIds);
    }

    return false;
  },
};
