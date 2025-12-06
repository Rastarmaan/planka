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
      sails.sockets.broadcast(`board:${inputs.board.id}`, 'boardTeamDelete', {
        item: boardTeam,
      });
    }

    return boardTeam;
  },
};
