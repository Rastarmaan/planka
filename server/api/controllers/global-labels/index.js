/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {},

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn() {
    const { currentUser } = this.req;

    if (!currentUser) {
      throw 'notEnoughRights';
    }

    const labels = await Label.qm.getGlobalLabels();

    return {
      items: labels,
    };
  },
};
