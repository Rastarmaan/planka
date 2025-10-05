/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /projects/{projectId}/duplicate:
 *   post:
 *     summary: Duplicate project
 *     description: Duplicates a project as a new project or into an existing project (merge boards) without data loss.
 *     tags:
 *       - Projects
 *     operationId: duplicateProject
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: ID of the source project
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mode
 *             properties:
 *               mode:
 *                 type: string
 *                 enum: [new, existing]
 *               targetProjectId:
 *                 type: string
 *                 nullable: true
 *               name:
 *                 type: string
 *                 nullable: true
 *               includeArchived:
 *                 type: boolean
 *                 default: false
 *               requestId:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Project duplicated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Project'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  PROJECT_NOT_FOUND: { projectNotFound: 'Project not found' },
  NOT_ENOUGH_RIGHTS: { notEnoughRights: 'Not enough rights' },
  INVALID_MODE: { invalidMode: 'Invalid duplication mode' },
};

module.exports = {
  inputs: {
    projectId: { ...idInput, required: true },
    mode: { type: 'string', isIn: ['new', 'existing'], required: true },
    targetProjectId: { type: 'string' },
    name: { type: 'string', maxLength: 255 },
    includeArchived: { type: 'boolean' },
    requestId: { type: 'string', isNotEmptyString: true, maxLength: 128 },
  },

  exits: {
    projectNotFound: { responseType: 'notFound' },
    notEnoughRights: { responseType: 'forbidden' },
    invalidMode: { responseType: 'badRequest' },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const project = await Project.findOne({ id: inputs.projectId });
    if (!project) throw Errors.PROJECT_NOT_FOUND;

    const projectManager = await ProjectManager.qm.getOneByProjectIdAndUserId(
      project.id,
      currentUser.id,
    );
    if (!projectManager) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    if (inputs.mode !== 'new' && inputs.mode !== 'existing') {
      throw Errors.INVALID_MODE;
    }

    const result = await sails.helpers.projects.duplicate.with({
      sourceProjectId: inputs.projectId,
      mode: inputs.mode,
      targetProjectId: inputs.targetProjectId,
      name: inputs.name,
      includeArchived: Boolean(inputs.includeArchived),
      userId: currentUser.id,
      requestId: inputs.requestId,
    });

    return { item: result.project };
  },
};
