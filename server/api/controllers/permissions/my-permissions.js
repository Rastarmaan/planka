/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /permissions/my:
 *   get:
 *     summary: Get current user's permissions
 *     description: Retrieves all document permissions granted to the current user
 *     tags:
 *       - Permissions
 */

module.exports = {
  inputs: {},

  async fn() {
    const currentUserId = this.req.currentUser.id;

    const permissions = await DocumentPermission.find({
      user: currentUserId,
    }).populate('grantedByUser');

    const enrichedPermissions = await Promise.all(
      permissions.map(async (permission) => {
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

    return {
      items: validPermissions,
    };
  },
};
