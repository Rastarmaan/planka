/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /permissions/{resourceType}/{resourceId}:
 *   get:
 *     summary: List permissions
 *     description: Get all permissions for a resource
 *     tags:
 *       - Permissions
 */

module.exports = {
  inputs: {
    resourceType: {
      type: 'string',
      required: true,
      isIn: ['space', 'folder', 'file'],
    },
    resourceId: {
      type: 'string',
      required: true,
      regex: /^\d+$/,
    },
  },

  async fn(inputs) {
    const permissions = await DocumentPermission.find({
      resourceType: inputs.resourceType,
      resourceId: inputs.resourceId,
    })
      .populate('user')
      .populate('team');

    return {
      items: permissions,
    };
  },
};
