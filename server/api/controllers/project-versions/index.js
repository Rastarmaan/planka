/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /projects/{projectId}/versions:
 *   get:
 *     summary: List project versions
 *     description: Retrieves all versions for a specific project. Requires project access permissions.
 *     tags:
 *       - Project Versions
 *     operationId: listProjectVersions
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: ID of the project to list versions for
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Maximum number of versions to return
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 5
 *       - name: offset
 *         in: query
 *         required: false
 *         description: Number of versions to skip
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *     responses:
 *       200:
 *         description: Project versions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProjectVersion'
 *                 total:
 *                   type: integer
 *                   description: Total number of versions available
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Project not found
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
};

module.exports = {
  inputs: {
    projectId: {
      ...idInput,
      required: true,
    },
    limit: {
      type: 'number',
      min: 1,
      max: 50,
      defaultsTo: 5,
    },
    offset: {
      type: 'number',
      min: 0,
      defaultsTo: 0,
    },
  },

  exits: {
    projectNotFound: {
      responseType: 'notFound',
    },
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const project = await Project.qm.getOneById(inputs.projectId);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager && !User.isAdminLevel(currentUser)) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const criteria = {
      projectId: inputs.projectId,
    };

    const projectVersions = await ProjectVersion.find(criteria)
      .sort('createdAt DESC')
      .limit(inputs.limit)
      .skip(inputs.offset);

    const total = await ProjectVersion.count(criteria);

    return exits.success({
      items: projectVersions,
      total,
    });
  },
};
