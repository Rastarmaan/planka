/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /projects/{projectId}/project-teams:
 *   post:
 *     summary: Add team to project
 *     description: Adds a team to a project. Requires project manager permissions.
 *     tags:
 *       - Project Teams
 *     operationId: createProjectTeam
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: ID of the project
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *             properties:
 *               teamId:
 *                 type: string
 *                 description: ID of the team to add
 *                 example: "1357158568008091265"
 *               role:
 *                 type: string
 *                 enum: [manager, viewer]
 *                 description: Role of the team in the project
 *                 example: viewer
 *     responses:
 *       200:
 *         description: Team added to project successfully
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
 *       409:
 *         $ref: '#/components/responses/Conflict'
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
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
  TEAM_NOT_FOUND: {
    teamNotFound: 'Team not found',
  },
  TEAM_ALREADY_IN_PROJECT: {
    teamAlreadyInProject: 'Team already in project',
  },
};

module.exports = {
  inputs: {
    projectId: {
      ...idInput,
      required: true,
    },
    teamId: {
      ...idInput,
      required: true,
    },
    role: {
      type: 'string',
      isIn: Object.values(Roles),
      defaultsTo: Roles.VIEWER,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    projectNotFound: {
      responseType: 'notFound',
    },
    teamNotFound: {
      responseType: 'notFound',
    },
    teamAlreadyInProject: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const project = await Project.qm.getOneById(inputs.projectId);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    // Check if user is project manager or admin
    if (!User.isAdminLevel(currentUser)) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        throw Errors.PROJECT_NOT_FOUND; // Forbidden
      }
    }

    const team = await Team.qm.getOneById(inputs.teamId);

    if (!team) {
      throw Errors.TEAM_NOT_FOUND;
    }

    // Check if team is already in project
    const existingProjectTeam = await ProjectTeam.qm.getOneByProjectIdAndTeamId(
      project.id,
      team.id,
    );

    if (existingProjectTeam) {
      throw Errors.TEAM_ALREADY_IN_PROJECT;
    }

    const projectTeam = await sails.helpers.projectTeams.createOne.with({
      project,
      team,
      role: inputs.role,
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: projectTeam,
    };
  },
};
