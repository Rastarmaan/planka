/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /reports/{id}:
 *   get:
 *     summary: Get report details
 *     description: Retrieves a specific report with all its phases
 *     tags:
 *       - Reports
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report retrieved successfully
 *       404:
 *         description: Report not found
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
    notFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (!User.isAdminLevel(currentUser)) {
      throw 'notFound';
    }

    const report = await Report.findOne({
      id: inputs.id,
      isDeleted: false,
    });

    if (!report) {
      throw 'notFound';
    }

    const phases = await ReportPhase.find({
      reportId: report.id,
      isDeleted: false,
    }).sort('position ASC');

    return {
      item: report,
      included: {
        reportPhases: phases,
      },
    };
  },
};
