/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /project-categories:
 *   post:
 *     summary: Create project category
 *     description: Creates a new project category. Only admins can create categories.
 *     tags:
 *       - ProjectCategories
 *     operationId: createProjectCategory
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
 *                 maxLength: 128
 *                 description: Name of the category
 *                 example: Design
 *               description:
 *                 type: string
 *                 maxLength: 1024
 *                 nullable: true
 *                 description: Description of the category
 *                 example: Design-related projects
 *               color:
 *                 type: string
 *                 maxLength: 16
 *                 nullable: true
 *                 description: Color code for the category
 *                 example: "#FF5733"
 *     responses:
 *       200:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/ProjectCategory'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

module.exports = {
  inputs: {
    name: {
      type: 'string',
      maxLength: 128,
      required: true,
    },
    description: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 1024,
      allowNull: true,
    },
    color: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 16,
      allowNull: true,
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const values = _.pick(inputs, ['name', 'description', 'color']);

    const projectCategory = await sails.helpers.projectCategories.createOne.with({
      values,
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: projectCategory,
    };
  },
};
