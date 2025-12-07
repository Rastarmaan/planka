/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /permissions/my:
 *   get:
 *     summary: Get current user's permissions
 *     description: Retrieves all document permissions granted to the current user (directly or through team membership)
 *     tags:
 *       - Permissions
 */

module.exports = {
  inputs: {},

  async fn() {
    const currentUserId = this.req.currentUser.id;

    // Get user's direct permissions
    const userPermissions = await DocumentPermission.find({
      user: currentUserId,
    }).populate('grantedByUser');

    const teamMemberships = await TeamMembership.find({
      userId: currentUserId,
    });
    const teamIds = teamMemberships.map((tm) => tm.teamId);

    let teamPermissions = [];
    if (teamIds.length > 0) {
      teamPermissions = await DocumentPermission.find({
        team: teamIds,
      }).populate('grantedByUser');
    }

    const allPermissions = [...userPermissions, ...teamPermissions];

    const enrichedPermissions = await Promise.all(
      allPermissions.map(async (permission) => {
        let resource = null;
        let space = null;

        switch (permission.resourceType) {
          case DocumentPermission.ResourceTypes.SPACE:
            resource = await Space.findOne({ id: permission.resourceId, isDeleted: false });
            space = resource;
            break;
          case DocumentPermission.ResourceTypes.FOLDER:
            resource = await DocumentFolder.findOne({
              id: permission.resourceId,
              isDeleted: false,
            });
            if (resource) {
              space = await Space.findOne({ id: resource.space, isDeleted: false });
            }
            break;
          case DocumentPermission.ResourceTypes.FILE:
            resource = await DocumentFile.findOne({
              id: permission.resourceId,
              isDeleted: false,
            });
            if (resource) {
              space = await Space.findOne({ id: resource.space, isDeleted: false });
            }
            break;
          default:
            break;
        }

        return {
          ...permission,
          resource: resource
            ? {
                id: resource.id,
                name: resource.name,
              }
            : null,
          space: space
            ? {
                id: space.id,
                name: space.name,
              }
            : null,
        };
      }),
    );

    const validPermissions = enrichedPermissions.filter((p) => p.resource !== null);

    const uniquePermissions = [];
    const seenResourceIds = new Set();

    validPermissions.sort((a, b) => {
      const aScore = (a.canEdit ? 4 : 0) + (a.canDelete ? 2 : 0) + (a.canShare ? 1 : 0);
      const bScore = (b.canEdit ? 4 : 0) + (b.canDelete ? 2 : 0) + (b.canShare ? 1 : 0);
      return bScore - aScore;
    });

    validPermissions.forEach((p) => {
      const key = `${p.resourceType}-${p.resourceId}`;
      if (!seenResourceIds.has(key)) {
        seenResourceIds.add(key);
        uniquePermissions.push(p);
      }
    });

    return {
      items: uniquePermissions,
    };
  },
};
