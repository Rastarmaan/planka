/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /project-teams/{id}:
 *   delete:
 *     summary: Remove team from project
 *     description: Removes a team from a project. Requires project manager permissions.
 *     tags:
 *       - Project Teams
 *     operationId: deleteProjectTeam
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the project team
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Team removed from project successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/ProjectTeam'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

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
    if (!User.isAdminLevel(currentUser)) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    const deletedProjectTeam = await sails.helpers.projectTeams.deleteOne.with({
      record: projectTeam,
      project,
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: deletedProjectTeam,
    };
  },
};
