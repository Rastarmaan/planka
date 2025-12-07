/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /projects/{projectId}/versions/{versionId}/restore:
 *   post:
 *     summary: Restore project version
 *     description: Restores a project to a previous version state. Requires project manager permissions.
 *     tags:
 *       - Project Versions
 *     operationId: restoreProjectVersion
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: ID of the project to restore
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *       - name: versionId
 *         in: path
 *         required: true
 *         description: ID of the version to restore to
 *         schema:
 *           type: string
 *           example: "1357158568008091265"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               force:
 *                 type: boolean
 *                 default: false
 *                 description: Skip automatic backup creation before restoration
 *     responses:
 *       200:
 *         description: Project restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 projectId:
 *                   type: string
 *                   example: "1357158568008091264"
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
    force: {
      type: 'boolean',
      defaultsTo: false,
      description: 'Skip automatic backup creation before restoration',
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

    if (!isProjectManager && !User.isAdminLevel(currentUser)) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const projectVersion = await ProjectVersion.findOne({
      id: inputs.versionId,
      projectId: inputs.projectId,
    });

    if (!projectVersion) {
      throw Errors.VERSION_NOT_FOUND;
    }

    const result = await sails.helpers.projectVersions.restoreSnapshot.with({
      projectVersionId: inputs.versionId,
      requestId: inputs.requestId,
      request: this.req,
    });

    return exits.success(result);
  },
};
