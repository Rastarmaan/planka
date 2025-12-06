/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /teams/{id}:
 *   delete:
 *     summary: Delete team
 *     description: Deletes a team. Requires team manager permissions or admin.
 *     tags:
 *       - Teams
 *     operationId: deleteTeam
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
 *         description: Team deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Team'
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

    // Check if user is team manager or admin
    if (currentUser.role !== User.Roles.ADMIN) {
      const teamMembership = await TeamMembership.qm.getOneByTeamIdAndUserId(
        team.id,
        currentUser.id,
      );

      if (!teamMembership || teamMembership.role !== Roles.MANAGER) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    const deletedTeam = await sails.helpers.teams.deleteOne.with({
      record: team,
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: deletedTeam,
    };
  },
};
