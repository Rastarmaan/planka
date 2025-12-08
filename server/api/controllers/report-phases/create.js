/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /reports/{reportId}/phases:
 *   post:
 *     summary: Create a new phase
 *     description: Adds a new phase to a report
 *     tags:
 *       - Report Phases
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               position:
 *                 type: number
 *     responses:
 *       200:
 *         description: Phase created successfully
 */

module.exports = {
  inputs: {
    reportId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
    description: {
      type: 'string',
      defaultsTo: '',
    },
    startDate: {
      type: 'string',
      allowNull: true,
    },
    endDate: {
      type: 'string',
      allowNull: true,
    },
    position: {
      type: 'number',
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
      id: inputs.reportId,
      isDeleted: false,
    });

    if (!report) {
      throw 'notFound';
    }

    const values = _.pick(inputs, ['name', 'description', 'startDate', 'endDate', 'position']);
    values.report = report.id;

    const phase = await sails.helpers.reportPhases.createOne.with({
      values,
      request: this.req,
    });

    return {
      item: phase,
    };
  },
};
