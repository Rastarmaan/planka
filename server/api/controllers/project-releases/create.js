/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /projects/{projectId}/releases:
 *   post:
 *     summary: Create a new release
 *     description: Creates a new release for the specified project.
 *     tags:
 *       - Project Releases
 *     operationId: createProjectRelease
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *         example: "1357158568008091264"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - version
 *             properties:
 *               version:
 *                 type: string
 *                 maxLength: 50
 *                 description: Version string for the release
 *                 example: "1.2.4"
 *               name:
 *                 type: string
 *                 maxLength: 255
 *                 nullable: true
 *                 description: Optional name for the release
 *                 example: "Spring 2024 Release"
 *               description:
 *                 type: string
 *                 maxLength: 1024
 *                 nullable: true
 *                 description: Detailed description of the release
 *                 example: "This release includes new features and bug fixes..."
 *               targetDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: Target date for the release
 *                 example: "2024-03-15T10:00:00.000Z"
 *     responses:
 *       200:
 *         description: Release created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/ProjectRelease'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */

module.exports = {
  inputs: {
    projectId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    version: {
      type: 'string',
      maxLength: 50,
      required: true,
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 255,
      allowNull: true,
    },
    description: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 1024,
      allowNull: true,
    },
    targetDate: {
      type: 'string',
      custom: (value) => moment(value).isValid(),
      allowNull: true,
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const project = await Project.findOne(inputs.projectId).populate('managerUsers');

    if (!project) {
      throw 'notFound';
    }

    const isProjectManager = project.managerUsers.some(
      (managerUser) => managerUser.id === currentUser.id,
    );

    if (!isProjectManager && currentUser.role !== User.Roles.ADMIN) {
      throw 'forbidden';
    }

    // Check if version already exists for this project
    const existingRelease = await ProjectRelease.findOne({
      projectId: inputs.projectId,
      version: inputs.version,
    });

    if (existingRelease) {
      throw {
        name: 'conflict',
        message: 'Release with this version already exists',
      };
    }

    const values = {
      ...inputs,
      projectId: inputs.projectId,
    };

    if (inputs.targetDate) {
      values.targetDate = new Date(inputs.targetDate);
    }

    const release = await ProjectRelease.create(values).fetch();

    return exits.success({
      item: release,
    });
  },
};
