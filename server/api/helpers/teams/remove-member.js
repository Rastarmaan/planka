/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    record: {
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

  async fn(inputs) {
    const teamMembership = await TeamMembership.qm.deleteOne(inputs.record.id);

    if (teamMembership) {
      sails.sockets.broadcast('user', 'teamMembershipDelete', {
        item: teamMembership,
      });

      const boardTeams = await BoardTeam.qm.getByTeamId(teamMembership.teamId);

      await Promise.all(
        boardTeams.map(async (boardTeam) => {
          const otherBoardTeams = await BoardTeam.qm.getByBoardId(boardTeam.boardId);
          const otherTeamIds = otherBoardTeams
            .filter((bt) => bt.teamId !== teamMembership.teamId)
            .map((bt) => bt.teamId);

          let isInOtherTeam = false;

          const userTeamMemberships = await TeamMembership.qm.getByUserId(teamMembership.userId);
          const userTeamIds = userTeamMemberships.map((tm) => tm.teamId);

          isInOtherTeam = otherTeamIds.some((otherTeamId) => userTeamIds.includes(otherTeamId));

          if (!isInOtherTeam) {
            const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
              boardTeam.boardId,
              teamMembership.userId,
            );

            if (boardMembership) {
              const board = await Board.qm.getOneById(boardTeam.boardId);
              const project = await Project.qm.getOneById(board.projectId);

              try {
                await sails.helpers.boardMemberships.deleteOne.with({
                  project,
                  board,
                  record: boardMembership,
                  actorUser: inputs.actorUser,
                  request: inputs.request,
                });
              } catch (error) {
                sails.log.error('Error removing team member from board:', error);
              }
            }
          }
        }),
      );
    }

    return teamMembership;
  },
};
