/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Create a new report
 *     description: Creates a new report with optional phases
 *     tags:
 *       - Reports
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
 *                 example: "Q1 2026 Product Launch"
 *               phases:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *     responses:
 *       200:
 *         description: Report created successfully
 */

module.exports = {
  inputs: {
    name: {
      type: 'string',
      required: true,
    },
    phases: {
      type: 'json',
      custom: (value) => {
        if (!_.isArray(value)) {
          return false;
        }

        return _.every(
          value,
          (phase) =>
            _.isPlainObject(phase) &&
            _.isString(phase.name) &&
            (!_.isUndefined(phase.description) ? _.isString(phase.description) : true) &&
            (!_.isUndefined(phase.startDate) ? _.isString(phase.startDate) : true) &&
            (!_.isUndefined(phase.endDate) ? _.isString(phase.endDate) : true),
        );
      },
      defaultsTo: [],
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

    const { report, included } = await sails.helpers.reports.createOne.with({
      values: {
        name: inputs.name,
      },
      phases: inputs.phases,
      request: this.req,
    });

    return {
      item: report,
      included,
    };
  },
};
