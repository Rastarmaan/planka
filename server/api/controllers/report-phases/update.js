/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /report-phases/{id}:
 *   patch:
 *     summary: Update phase
 *     description: Updates a report phase
 *     tags:
 *       - Report Phases
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
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [todo, doing, done]
 *               position:
 *                 type: number
 *     responses:
 *       200:
 *         description: Phase updated successfully
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
    description: {
      type: 'string',
    },
    startDate: {
      type: 'string',
      allowNull: true,
    },
    endDate: {
      type: 'string',
      allowNull: true,
    },
    status: {
      type: 'string',
      isIn: Object.values(ReportPhase.Statuses),
    },
    position: {
      type: 'number',
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

    let phase = await ReportPhase.findOne({
      id: inputs.id,
      isDeleted: false,
    });

    if (!phase) {
      throw 'notFound';
    }

    const values = _.pick(inputs, [
      'name',
      'description',
      'startDate',
      'endDate',
      'status',
      'position',
    ]);

    phase = await sails.helpers.reportPhases.updateOne.with({
      record: phase,
      values,
      request: this.req,
    });

    return {
      item: phase,
    };
  },
};
