/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

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
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    userAlreadyTeamMember: {},
  },

  async fn(inputs) {
    let teamMembership;

    try {
      teamMembership = await TeamMembership.qm.createOne({
        teamId: inputs.team.id,
        userId: inputs.user.id,
      });
    } catch (error) {
      if (error.code === 'E_UNIQUE') {
        throw 'userAlreadyTeamMember';
      }

      throw error;
    }

    sails.sockets.broadcast('teamMembershipCreate', {
      item: teamMembership,
    });

    const boardTeams = await BoardTeam.qm.getByTeamId(inputs.team.id);

    await Promise.all(
      boardTeams.map(async (boardTeam) => {
        const board = await Board.qm.getOneById(boardTeam.boardId);
        const project = await Project.qm.getOneById(board.projectId);

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
          if (error !== 'userAlreadyBoardMember') {
            sails.log.error('Error adding team member to board:', error);
          }
        }
      }),
    );

    return teamMembership;
  },
};
