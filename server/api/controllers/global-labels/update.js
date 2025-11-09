/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    color: {
      type: 'string',
      isIn: Label.COLORS,
    },
    position: {
      type: 'number',
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    labelNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (currentUser.role !== 'admin') {
      throw 'notEnoughRights';
    }

    const label = await Label.qm.getOneById(inputs.id);

    if (!label || !label.isGlobal) {
      throw 'labelNotFound';
    }

    const values = _.pick(inputs, ['name', 'color', 'position']);

    const updatedLabel = await Label.qm.updateOne(
      {
        id: inputs.id,
      },
      values,
    );

    if (!updatedLabel) {
      throw 'labelNotFound';
    }

    sails.sockets.broadcast('global', 'globalLabelUpdate', {
      item: updatedLabel,
    });

    return {
      item: updatedLabel,
    };
  },
};
