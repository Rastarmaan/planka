/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /reports/{id}:
 *   patch:
 *     summary: Update report
 *     description: Updates report name
 *     tags:
 *       - Reports
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Report updated successfully
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

    let report = await Report.findOne({
      id: inputs.id,
      isDeleted: false,
    });

    if (!report) {
      throw 'notFound';
    }

    const values = _.pick(inputs, ['name']);

    report = await sails.helpers.reports.updateOne.with({
      record: report,
      values,
      request: this.req,
    });

    return {
      item: report,
    };
  },
};
