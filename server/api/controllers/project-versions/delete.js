/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /projects/{projectId}/versions/{versionId}:
 *   delete:
 *     summary: Delete project version
 *     description: Deletes a specific project version. Requires project manager permissions.
 *     tags:
 *       - Project Versions
 *     operationId: deleteProjectVersion
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: ID of the project
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *       - name: versionId
 *         in: path
 *         required: true
 *         description: ID of the version to delete
 *         schema:
 *           type: string
 *           example: "1357158568008091265"
 *     responses:
 *       200:
 *         description: Version deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Project or version not found
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
  VERSION_NOT_FOUND: {
    versionNotFound: 'Version not found',
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
    versionId: {
      ...idInput,
      required: true,
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
    versionNotFound: {
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

    if (!isProjectManager && currentUser.role !== User.Roles.ADMIN) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const projectVersion = await ProjectVersion.findOne({
      id: inputs.versionId,
      projectId: inputs.projectId,
    });

    if (!projectVersion) {
      throw Errors.VERSION_NOT_FOUND;
    }

    await ProjectVersion.destroyOne({ id: inputs.versionId });

    sails.sockets.broadcast(
      `project:${project.id}`,
      'projectVersionDelete',
      {
        item: projectVersion,
      },
      this.req,
    );

    return exits.success({
      success: true,
    });
  },
};
