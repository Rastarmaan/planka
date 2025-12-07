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
    const teamMemberships = await TeamMembership.find({ teamId: inputs.record.id });
    const userIds = teamMemberships.map((tm) => tm.userId);

    const boardTeams = await BoardTeam.find({ teamId: inputs.record.id });

    await Promise.all(
      boardTeams.map(async (boardTeam) => {
        const board = await Board.qm.getOneById(boardTeam.boardId);
        if (!board) return;

        const project = await Project.qm.getOneById(board.projectId);
        if (!project) return;

        const projectManagers = await ProjectManager.find({ projectId: project.id });
        const projectManagerUserIds = projectManagers.map((pm) => pm.userId);

        const otherBoardTeams = await BoardTeam.find({
          boardId: board.id,
          teamId: { '!=': inputs.record.id },
        });
        const otherTeamIds = otherBoardTeams.map((bt) => bt.teamId);

        await Promise.all(
          userIds.map(async (userId) => {
            if (projectManagerUserIds.includes(userId)) {
              return;
            }

            let userInOtherTeam = false;
            if (otherTeamIds.length > 0) {
              const otherMemberships = await TeamMembership.find({
                teamId: otherTeamIds,
                userId,
              });
              userInOtherTeam = otherMemberships.length > 0;
            }

            if (!userInOtherTeam) {
              const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
                board.id,
                userId,
              );
              if (boardMembership) {
                const user = await User.qm.getOneById(userId);
                if (user) {
                  await sails.helpers.boardMemberships.deleteOne.with({
                    record: boardMembership,
                    user,
                    project,
                    board,
                    actorUser: inputs.actorUser,
                  });
                }
              }
            }
          }),
        );
      }),
    );

    const team = await Team.qm.deleteOne(inputs.record.id);

    if (team) {
      sails.sockets.broadcast('user', 'teamDelete', {
        item: team,
      });
    }

    return team;
  },
};
