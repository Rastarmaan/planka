/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  friendlyName: 'Transfer board',

  description: 'Transfer a board to another project',

  inputs: {
    id: {
      type: 'string',
      required: true,
    },
    targetProjectId: {
      type: 'string',
      required: true,
    },
    position: {
      type: 'number',
    },
    request: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const { id, targetProjectId, position, request } = inputs;

    const board = await Board.findOne(id).populate('memberUsers');

    if (!board) {
      throw new Error('Board not found');
    }

    const sourceProjectId = board.projectId;

    let newPosition = position;
    if (newPosition === undefined) {
      const lastBoard = await Board.find({
        projectId: targetProjectId,
      })
        .sort('position DESC')
        .limit(1);

      newPosition = lastBoard.length > 0 ? lastBoard[0].position + 65536 : 65536;
    }

    const targetProjectMembers = await ProjectManager.find({
      projectId: targetProjectId,
    }).populate('userId');

    const targetProjectMemberIds = targetProjectMembers.map((pm) => pm.userId.id);

    const currentBoardMemberships = await BoardMembership.find({ boardId: id });

    const membershipsToRemove = currentBoardMemberships.filter(
      (membership) => !targetProjectMemberIds.includes(membership.userId),
    );

    await Promise.all(
      membershipsToRemove.map(async (membership) => {
        await BoardMembership.destroyOne({ id: membership.id });

        sails.sockets.broadcast(
          `board:${id}`,
          'boardMembershipDelete',
          {
            item: membership,
          },
          request,
        );
      }),
    );

    const finalBoard = await Board.findOne(id).populate('memberUsers');

    sails.sockets.broadcast(
      `project:${sourceProjectId}`,
      'boardDelete',
      {
        item: { id },
      },
      request,
    );

    sails.sockets.broadcast(
      `project:${targetProjectId}`,
      'boardCreate',
      {
        item: finalBoard,
      },
      request,
    );

    sails.sockets.broadcast(
      `board:${id}`,
      'boardUpdate',
      {
        item: finalBoard,
      },
      request,
    );

    return finalBoard;
  },
};
