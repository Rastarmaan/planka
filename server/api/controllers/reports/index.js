/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Get all reports
 *     description: Retrieves all reports with their phases
 *     tags:
 *       - Reports
 *     responses:
 *       200:
 *         description: Reports retrieved successfully
 */

module.exports = {
  inputs: {},

  exits: {
    notFound: {
      responseType: 'notFound',
    },
  },

  async fn() {
    const { currentUser } = this.req;

    if (!User.isAdminLevel(currentUser)) {
      throw 'notFound';
    }

    const { reports, reportPhases, reportPhaseMemberships } = await sails.helpers.reports.getMany();

    return {
      items: reports,
      included: {
        reportPhases,
        reportPhaseMemberships,
      },
    };
  },
};
