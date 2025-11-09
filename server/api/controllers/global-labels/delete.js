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

    await Label.qm.deleteOne({
      id: inputs.id,
    });

    sails.sockets.broadcast('global', 'globalLabelDelete', {
      item: label,
    });

    return {
      item: label,
    };
  },
};
