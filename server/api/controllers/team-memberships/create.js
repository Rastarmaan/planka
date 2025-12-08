/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /teams/{teamId}/team-memberships:
 *   post:
 *     summary: Create team membership
 *     description: Adds a user to a team. Requires team manager permissions.
 *     tags:
 *       - Team Memberships
 *     operationId: createTeamMembership
 *     parameters:
 *       - name: teamId
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
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user to add
 *                 example: "1357158568008091265"
 *               role:
 *                 type: string
 *                 enum: [manager, member]
 *                 description: Role of the user in the team
 *                 example: member
 *     responses:
 *       200:
 *         description: Team membership created successfully
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
 *       409:
 *         $ref: '#/components/responses/Conflict'
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
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  USER_ALREADY_TEAM_MEMBER: {
    userAlreadyTeamMember: 'User already team member',
  },
};

module.exports = {
  inputs: {
    teamId: {
      ...idInput,
      required: true,
    },
    userId: {
      ...idInput,
      required: true,
    },
    role: {
      type: 'string',
      isIn: Object.values(Roles),
      defaultsTo: Roles.MEMBER,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    teamNotFound: {
      responseType: 'notFound',
    },
    userNotFound: {
      responseType: 'notFound',
    },
    userAlreadyTeamMember: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const team = await Team.qm.getOneById(inputs.teamId);

    if (!team) {
      throw Errors.TEAM_NOT_FOUND;
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

    const user = await User.qm.getOneById(inputs.userId, {
      withDeactivated: false,
    });

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    // Check if user is already a member
    const existingMembership = await TeamMembership.qm.getOneByTeamIdAndUserId(team.id, user.id);

    if (existingMembership) {
      throw Errors.USER_ALREADY_TEAM_MEMBER;
    }

    const { teamMembership, createdBoardMemberships } = await sails.helpers.teams.addMember.with({
      team,
      user,
      role: inputs.role,
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: teamMembership,
      included: {
        boardMemberships: createdBoardMemberships,
      },
    };
  },
};
