/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Create team
 *     description: Creates a new team. The current user becomes the team manager.
 *     tags:
 *       - Teams
 *     operationId: createTeam
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
 *                 description: Name of the team
 *                 example: "Development Team"
 *     responses:
 *       200:
 *         description: Team created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Team'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

module.exports = {
  inputs: {
    name: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const values = _.pick(inputs, ['name']);

    const team = await sails.helpers.teams.createOne.with({
      values: {
        ...values,
        creatorUser: currentUser,
      },
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: team,
    };
  },
};
