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
    board: {
      type: 'ref',
      required: true,
    },
    project: {
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
    const boardTeam = await BoardTeam.qm.deleteOne(inputs.record.id);

    if (boardTeam) {
      const teamMemberships = await TeamMembership.qm.getByTeamId(boardTeam.teamId);

      const otherBoardTeams = await BoardTeam.qm.getByBoardId(inputs.board.id);
      const otherTeamIds = otherBoardTeams.map((bt) => bt.teamId);

      const projectManagers = await ProjectManager.qm.getByProjectId(inputs.project.id);
      const projectManagerUserIds = projectManagers.map((pm) => pm.userId);

      const deletedBoardMemberships = [];

      await Promise.all(
        teamMemberships.map(async (teamMembership) => {
          if (projectManagerUserIds.includes(teamMembership.userId)) {
            return;
          }

          const userTeamMemberships = await TeamMembership.qm.getByUserId(teamMembership.userId);
          const userTeamIds = userTeamMemberships.map((tm) => tm.teamId);

          const isInOtherTeam = otherTeamIds.some((otherTeamId) =>
            userTeamIds.includes(otherTeamId),
          );

          if (!isInOtherTeam) {
            const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
              inputs.board.id,
              teamMembership.userId,
            );

            if (boardMembership) {
              const user = await User.qm.getOneById(teamMembership.userId);

              if (user) {
                try {
                  const deletedMembership = await sails.helpers.boardMemberships.deleteOne.with({
                    project: inputs.project,
                    board: inputs.board,
                    record: boardMembership,
                    user,
                    actorUser: inputs.actorUser,
                    request: inputs.request,
                  });

                  if (deletedMembership) {
                    deletedBoardMemberships.push(deletedMembership);
                  }
                } catch (error) {
                  sails.log.error('Error removing team member from board:', error);
                }
              }
            }
          }
        }),
      );

      sails.sockets.broadcast(`board:${inputs.board.id}`, 'boardTeamDelete', {
        item: boardTeam,
        included: {
          boardMemberships: deletedBoardMemberships,
        },
      });
    }

    return boardTeam;
  },
};
