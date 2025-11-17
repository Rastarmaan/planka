/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /projects/{projectId}/releases/{id}:
 *   put:
 *     summary: Update a release
 *     description: Updates an existing release for the specified project.
 *     tags:
 *       - Project Releases
 *     operationId: updateProjectRelease
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *         example: "1357158568008091264"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the release
 *         example: "1357158568008091265"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               version:
 *                 type: string
 *                 maxLength: 50
 *                 description: Version string for the release
 *                 example: "1.2.5"
 *               name:
 *                 type: string
 *                 maxLength: 255
 *                 nullable: true
 *                 description: Optional name for the release
 *                 example: "Spring 2024 Release - Updated"
 *               description:
 *                 type: string
 *                 maxLength: 1024
 *                 nullable: true
 *                 description: Detailed description of the release
 *                 example: "This release includes updated features..."
 *               targetDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: Target date for the release
 *                 example: "2024-03-20T10:00:00.000Z"
 *     responses:
 *       200:
 *         description: Release updated successfully
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
 *       403:
 *         $ref: '#/components/responses/Forbidden'
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
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    version: {
      type: 'string',
      maxLength: 50,
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

    const release = await ProjectRelease.findOne({
      id: inputs.id,
      projectId: inputs.projectId,
    });

    if (!release) {
      throw 'notFound';
    }

    // Prevent editing released releases
    if (release.status === ProjectRelease.Statuses.RELEASED) {
      throw {
        name: 'forbidden',
        message: 'Cannot modify released releases',
      };
    }

    // Check version uniqueness if version is being changed
    if (inputs.version && inputs.version !== release.version) {
      const existingRelease = await ProjectRelease.findOne({
        projectId: inputs.projectId,
        version: inputs.version,
        id: { '!=': inputs.id },
      });

      if (existingRelease) {
        throw {
          name: 'conflict',
          message: 'Release with this version already exists',
        };
      }
    }

    const values = _.pick(inputs, ['version', 'name', 'description', 'targetDate']);

    if (inputs.targetDate) {
      values.targetDate = new Date(inputs.targetDate);
    }

    const updatedRelease = await ProjectRelease.updateOne({
      id: inputs.id,
      projectId: inputs.projectId,
    }).set(values);

    return exits.success({
      item: updatedRelease,
    });
  },
};
