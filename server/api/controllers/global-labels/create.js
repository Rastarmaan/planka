/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    name: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    color: {
      type: 'string',
      isIn: Label.COLORS,
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (currentUser.role !== 'admin') {
      throw 'notEnoughRights';
    }

    const globalLabels = await Label.qm.getGlobalLabels();

    const position =
      globalLabels.length > 0 ? Math.max(...globalLabels.map((l) => l.position)) + 1 : 65536;

    const labelData = {
      ...inputs,
      position,
      isGlobal: true,
      boardId: null,
    };

    const label = await Label.qm.createOne(labelData);

    sails.sockets.broadcast('global', 'globalLabelCreate', {
      item: label,
    });

    return {
      item: label,
    };
  },
};
