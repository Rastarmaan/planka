/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /spaces/{spaceId}/folders:
 *   get:
 *     summary: List folders in a space
 *     description: Get all folders in a specific space
 *     tags:
 *       - Folders
 *     parameters:
 *       - name: spaceId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: parentFolderId
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Folders retrieved successfully
 */

module.exports = {
  inputs: {
    spaceId: {
      type: 'string',
      required: true,
      regex: /^\d+$/,
    },
    parentFolderId: {
      type: 'string',
      allowNull: true,
      regex: /^\d+$/,
    },
    includeDeleted: {
      type: 'boolean',
      defaultsTo: false,
    },
  },

  exits: {
    notFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;
    const isAdmin = currentUser.role === 'admin';

    let space;

    if (isAdmin) {
      // Admins can access all spaces
      space = await Space.findOne({
        id: inputs.spaceId,
        isDeleted: false,
      });
    } else {
      space = await Space.findOne({
        id: inputs.spaceId,
        isDeleted: false,
      });

      if (space) {
        const userPermissions = await DocumentPermission.find({
          user: currentUser.id,
          or: [
            { resourceType: 'space', resourceId: inputs.spaceId },
            { resourceType: 'folder' },
            { resourceType: 'file' },
          ],
        }).limit(1);

        const teamMemberships = await TeamMembership.find({
          userId: currentUser.id,
        });
        const teamIds = teamMemberships.map((tm) => tm.teamId);

        let teamPermissions = [];
        if (teamIds.length > 0) {
          teamPermissions = await DocumentPermission.find({
            team: teamIds,
            or: [
              { resourceType: 'space', resourceId: inputs.spaceId },
              { resourceType: 'folder' },
              { resourceType: 'file' },
            ],
          }).limit(1);
        }

        if (userPermissions.length === 0 && teamPermissions.length === 0) {
          space = null;
        }
      }
    }

    if (!space) {
      throw 'notFound';
    }

    let folders = [];
    let files = [];

    if (isAdmin) {
      const criteria = {
        space: inputs.spaceId,
      };

      if (!inputs.includeDeleted) {
        criteria.isDeleted = false;
      }

      if (inputs.parentFolderId) {
        criteria.parentFolder = inputs.parentFolderId;
      } else {
        criteria.parentFolder = null;
      }

      folders = await DocumentFolder.find(criteria).sort('name ASC');

      if (!inputs.parentFolderId) {
        files = await DocumentFile.find({
          space: inputs.spaceId,
          folder: null,
          isDeleted: false,
        }).sort('name ASC');
      }
    } else {
      const userPermissions = await DocumentPermission.find({
        user: currentUser.id,
      });

      const teamMemberships = await TeamMembership.find({
        userId: currentUser.id,
      });
      const teamIds = teamMemberships.map((tm) => tm.teamId);

      let teamPermissions = [];
      if (teamIds.length > 0) {
        teamPermissions = await DocumentPermission.find({
          team: teamIds,
        });
      }

      const allPermissions = [...userPermissions, ...teamPermissions];

      const hasSpacePermission = allPermissions.some(
        (p) => p.resourceType === 'space' && String(p.resourceId) === String(inputs.spaceId),
      );

      if (hasSpacePermission) {
        const criteria = {
          space: inputs.spaceId,
        };

        if (!inputs.includeDeleted) {
          criteria.isDeleted = false;
        }

        if (inputs.parentFolderId) {
          criteria.parentFolder = inputs.parentFolderId;
        } else {
          criteria.parentFolder = null;
        }

        folders = await DocumentFolder.find(criteria).sort('name ASC');

        if (!inputs.parentFolderId) {
          files = await DocumentFile.find({
            space: inputs.spaceId,
            folder: null,
            isDeleted: false,
          }).sort('name ASC');
        }
      } else {
        const allowedFolderIds = allPermissions
          .filter((p) => p.resourceType === 'folder')
          .map((p) => String(p.resourceId));

        const allowedFileIds = allPermissions
          .filter((p) => p.resourceType === 'file')
          .map((p) => String(p.resourceId));

        if (allowedFolderIds.length > 0) {
          folders = await DocumentFolder.find({
            id: allowedFolderIds,
            space: inputs.spaceId,
            isDeleted: false,
          }).sort('name ASC');

          if (inputs.parentFolderId) {
            folders = folders.filter(
              (f) => String(f.parentFolder) === String(inputs.parentFolderId),
            );
          } else {
            folders = folders.filter((f) => !f.parentFolder);
          }
        }

        if (allowedFileIds.length > 0 && !inputs.parentFolderId) {
          files = await DocumentFile.find({
            id: allowedFileIds,
            space: inputs.spaceId,
            folder: null,
            isDeleted: false,
          }).sort('name ASC');
        }
      }
    }

    return {
      items: folders,
      included: {
        files,
      },
    };
  },
};
