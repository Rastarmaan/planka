/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /project-teams/{id}:
 *   patch:
 *     summary: Update project team
 *     description: Updates a project team role. Requires project manager permissions.
 *     tags:
 *       - Project Teams
 *     operationId: updateProjectTeam
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the project team
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [manager, viewer]
 *                 description: Role of the team in the project
 *                 example: manager
 *     responses:
 *       200:
 *         description: Project team updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/ProjectTeam'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Roles = {
  MANAGER: 'manager',
  VIEWER: 'viewer',
};

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  PROJECT_TEAM_NOT_FOUND: {
    projectTeamNotFound: 'Project team not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    role: {
      type: 'string',
      isIn: Object.values(Roles),
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    projectTeamNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const projectTeam = await ProjectTeam.findOne({ id: inputs.id });

    if (!projectTeam) {
      throw Errors.PROJECT_TEAM_NOT_FOUND;
    }

    const project = await Project.qm.getOneById(projectTeam.projectId);

    if (!project) {
      throw Errors.PROJECT_TEAM_NOT_FOUND;
    }

    // Check if user is project manager or admin
    if (currentUser.role !== User.Roles.ADMIN) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    const values = _.pick(inputs, ['role']);

    const updatedProjectTeam = await sails.helpers.projectTeams.updateOne.with({
      record: projectTeam,
      values,
      project,
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: updatedProjectTeam,
    };
  },
};
