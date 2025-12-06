/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const Roles = {
  MANAGER: 'manager',
  MEMBER: 'member',
};

module.exports = {
  inputs: {
    team: {
      type: 'ref',
      required: true,
    },
    user: {
      type: 'ref',
      required: true,
    },
    role: {
      type: 'string',
      isIn: Object.values(Roles),
      defaultsTo: Roles.MEMBER,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const teamMembership = await TeamMembership.qm.createOne({
      teamId: inputs.team.id,
      userId: inputs.user.id,
      role: inputs.role,
    });

    sails.sockets.broadcast('user', 'teamMembershipCreate', {
      item: teamMembership,
    });

    const boardTeams = await BoardTeam.qm.getByTeamId(inputs.team.id);

    await Promise.all(
      boardTeams.map(async (boardTeam) => {
        const board = await Board.qm.getOneById(boardTeam.boardId);
        const project = await Project.qm.getOneById(board.projectId);

        const existingMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
          board.id,
          inputs.user.id,
        );

        if (!existingMembership) {
          try {
            await sails.helpers.boardMemberships.createOne.with({
              values: {
                board,
                user: inputs.user,
                role: boardTeam.role,
                canComment: boardTeam.canComment,
              },
              project,
              actorUser: inputs.actorUser,
              request: inputs.request,
            });
          } catch (error) {
            sails.log.error('Error adding team member to board:', error);
          }
        }
      }),
    );

    return teamMembership;
  },
};
