/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /reports/{id}:
 *   delete:
 *     summary: Delete report
 *     description: Soft deletes a report and all its phases
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
 *         description: Report deleted successfully
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

    await sails.helpers.reports.deleteOne.with({
      record: report,
      request: this.req,
    });

    return {
      item: report,
    };
  },
};
