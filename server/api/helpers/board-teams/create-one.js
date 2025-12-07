/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const Roles = {
  EDITOR: 'editor',
  VIEWER: 'viewer',
};

module.exports = {
  inputs: {
    board: {
      type: 'ref',
      required: true,
    },
    team: {
      type: 'ref',
      required: true,
    },
    role: {
      type: 'string',
      isIn: Object.values(Roles),
      defaultsTo: Roles.VIEWER,
    },
    canComment: {
      type: 'boolean',
      allowNull: true,
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
    const boardTeam = await BoardTeam.qm.createOne({
      boardId: inputs.board.id,
      teamId: inputs.team.id,
      role: inputs.role,
      canComment: inputs.canComment,
    });

    sails.sockets.broadcast(`board:${inputs.board.id}`, 'boardTeamCreate', {
      item: boardTeam,
    });

    const teamMemberships = await TeamMembership.qm.getByTeamId(inputs.team.id);

    const project = await Project.qm.getOneById(inputs.board.projectId);

    const createdBoardMemberships = [];
    const addedUsers = [];

    await Promise.all(
      teamMemberships.map(async (teamMembership) => {
        const user = await User.qm.getOneById(teamMembership.userId);

        if (user) {
          const existingMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
            inputs.board.id,
            user.id,
          );

          if (!existingMembership) {
            try {
              const boardMembership = await sails.helpers.boardMemberships.createOne.with({
                values: {
                  board: inputs.board,
                  user,
                  role: inputs.role,
                  canComment: inputs.canComment,
                },
                project,
                actorUser: inputs.actorUser,
              });
              createdBoardMemberships.push(boardMembership);
              addedUsers.push(sails.helpers.users.presentOne(user, {}));
            } catch (error) {
              sails.log.error('Error adding team member to board:', error);
            }
          }
        }
      }),
    );

    try {
      // eslint-disable-next-line global-require
      const boardSync = require('../../../utils/board-sync');
      await boardSync.syncBoardTeam(boardTeam, inputs.team, inputs.request);
    } catch (syncError) {
      sails.log.error('Error syncing board team:', syncError);
    }

    return {
      boardTeam,
      boardMemberships: createdBoardMemberships,
      users: addedUsers,
    };
  },
};
