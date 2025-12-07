/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /teams/{id}:
 *   get:
 *     summary: Get team
 *     description: Returns a single team by ID.
 *     tags:
 *       - Teams
 *     operationId: getTeam
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the team
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Team retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *                 - included
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Team'
 *                 included:
 *                   type: object
 *                   properties:
 *                     teamMemberships:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TeamMembership'
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  TEAM_NOT_FOUND: {
    teamNotFound: 'Team not found',
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
    teamNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const team = await Team.qm.getOneById(inputs.id);

    if (!team) {
      throw Errors.TEAM_NOT_FOUND;
    }

    // Check if user has access to this team
    if (currentUser.role !== User.Roles.ADMIN) {
      const teamMembership = await TeamMembership.qm.getOneByTeamIdAndUserId(
        team.id,
        currentUser.id,
      );

      if (!teamMembership) {
        throw Errors.TEAM_NOT_FOUND; // Forbidden
      }
    }

    // Get team memberships and users
    const teamMemberships = await TeamMembership.qm.getByTeamId(team.id);
    const userIds = teamMemberships.map((tm) => tm.userId);
    const users = await User.find({ id: userIds });

    return {
      item: team,
      included: {
        teamMemberships,
        users,
      },
    };
  },
};
