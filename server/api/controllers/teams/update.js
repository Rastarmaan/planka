/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /teams/{id}:
 *   patch:
 *     summary: Update team
 *     description: Updates a team. Requires team manager permissions.
 *     tags:
 *       - Teams
 *     operationId: updateTeam
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the team
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
 *               name:
 *                 type: string
 *                 description: Name of the team
 *                 example: "Updated Team Name"
 *     responses:
 *       200:
 *         description: Team updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Team'
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
  MEMBER: 'member',
};

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
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
    name: {
      type: 'string',
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
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

    // Check if user is team manager
    if (!User.isAdminLevel(currentUser)) {
      const teamMembership = await TeamMembership.qm.getOneByTeamIdAndUserId(
        team.id,
        currentUser.id,
      );

      if (!teamMembership || teamMembership.role !== Roles.MANAGER) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    const values = _.pick(inputs, ['name']);

    const updatedTeam = await sails.helpers.teams.updateOne.with({
      record: team,
      values,
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: updatedTeam,
    };
  },
};
