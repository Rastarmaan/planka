/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /report-phases/{id}:
 *   delete:
 *     summary: Delete phase
 *     description: Soft deletes a report phase
 *     tags:
 *       - Report Phases
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Phase deleted successfully
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

    const phase = await ReportPhase.findOne({
      id: inputs.id,
      isDeleted: false,
    });

    if (!phase) {
      throw 'notFound';
    }

    await sails.helpers.reportPhases.deleteOne.with({
      record: phase,
      request: this.req,
    });

    return {
      item: phase,
    };
  },
};
