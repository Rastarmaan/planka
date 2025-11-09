/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /project-categories:
 *   get:
 *     summary: Get all project categories
 *     description: Retrieves all project categories.
 *     tags:
 *       - ProjectCategories
 *     operationId: getProjectCategories
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - items
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProjectCategory'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
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

    const projectCategories = await ProjectCategory.find().sort('name ASC');

    return {
      items: projectCategories,
    };
  },
};
