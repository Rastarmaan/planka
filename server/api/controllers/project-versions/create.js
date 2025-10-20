/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /projects/{projectId}/versions:
 *   post:
 *     summary: Create project version
 *     description: Creates a snapshot version of the current project state. Requires project manager permissions.
 *     tags:
 *       - Project Versions
 *     operationId: createProjectVersion
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: ID of the project to create a version for
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 255
 *                 description: Name for this version
 *                 example: "Q4 2024 Release"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional description for this version
 *                 example: "Major project restructuring"
 *     responses:
 *       201:
 *         description: Project version created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/ProjectVersion'
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
    name: {
      type: 'string',
      required: true,
      isNotEmptyString: true,
      maxLength: 255,
    },
    description: {
      type: 'string',
      allowNull: true,
      maxLength: 500,
    },
    requestId: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
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

  async fn(inputs) {
    const { currentUser } = this.req;

    const project = await Project.qm.getOneById(inputs.projectId);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager && currentUser.role !== User.Roles.ADMIN) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const projectVersion = await sails.helpers.projectVersions.createSnapshot.with({
      projectId: inputs.projectId,
      creatorUserId: currentUser.id,
      name: inputs.name,
      description: inputs.description,
      requestId: inputs.requestId,
      request: this.req,
    });

    return {
      item: projectVersion,
    };
  },
};
