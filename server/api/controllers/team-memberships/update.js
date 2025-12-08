/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /team-memberships/{id}:
 *   patch:
 *     summary: Update team membership
 *     description: Updates a team membership role. Requires team manager permissions.
 *     tags:
 *       - Team Memberships
 *     operationId: updateTeamMembership
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the team membership
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
 *                 enum: [manager, member]
 *                 description: Role of the user in the team
 *                 example: manager
 *     responses:
 *       200:
 *         description: Team membership updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/TeamMembership'
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
    role: {
      type: 'string',
      isIn: Object.values(Roles),
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

    // Check if user is team manager or admin
    if (!User.isAdminLevel(currentUser)) {
      const currentUserMembership = await TeamMembership.qm.getOneByTeamIdAndUserId(
        team.id,
        currentUser.id,
      );

      if (!currentUserMembership || currentUserMembership.role !== Roles.MANAGER) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    const values = _.pick(inputs, ['role']);

    const updatedMembership = await sails.helpers.teams.updateMember.with({
      record: teamMembership,
      values,
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: updatedMembership,
    };
  },
};
