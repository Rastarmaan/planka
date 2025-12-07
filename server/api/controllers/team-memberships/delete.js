/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /team-memberships/{id}:
 *   delete:
 *     summary: Delete team membership
 *     description: Removes a user from a team. Requires team manager permissions.
 *     tags:
 *       - Team Memberships
 *     operationId: deleteTeamMembership
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the team membership
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Team membership deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/TeamMembership'
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
  TEAM_MEMBERSHIP_NOT_FOUND: {
    teamMembershipNotFound: 'Team membership not found',
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
    teamMembershipNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const teamMembership = await TeamMembership.findOne({ id: inputs.id });

    if (!teamMembership) {
      throw Errors.TEAM_MEMBERSHIP_NOT_FOUND;
    }

    const team = await Team.qm.getOneById(teamMembership.teamId);

    if (!team) {
      throw Errors.TEAM_MEMBERSHIP_NOT_FOUND;
    }

    // Check if user is team manager or admin (or removing themselves)
    if (currentUser.role !== User.Roles.ADMIN && teamMembership.userId !== currentUser.id) {
      const currentUserMembership = await TeamMembership.qm.getOneByTeamIdAndUserId(
        team.id,
        currentUser.id,
      );

      if (!currentUserMembership || currentUserMembership.role !== Roles.MANAGER) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    const { teamMembership: deletedMembership, deletedBoardMemberships } =
      await sails.helpers.teams.removeMember.with({
        record: teamMembership,
        actorUser: currentUser,
        request: this.req,
      });

    return {
      item: deletedMembership,
      included: {
        boardMemberships: deletedBoardMemberships,
      },
    };
  },
};
