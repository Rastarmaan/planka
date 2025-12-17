/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
    },
    text: {
      type: 'string',
      required: true,
      maxLength: 4096,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    notFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (!currentUser || !['admin', 'manager'].includes(currentUser.role)) {
      throw 'notEnoughRights';
    }

    const history = await ProjectHistory.findOne({ id: inputs.id });
    if (!history) {
      throw 'notFound';
    }

    const values = {
      text: inputs.text.trim(),
    };

    const [item] = await ProjectHistory.update({ id: inputs.id }).set(values).fetch();

    sails.sockets.broadcast('user', 'projectHistoryUpdate', { item }, this.req);

    return { item };
  },
};
