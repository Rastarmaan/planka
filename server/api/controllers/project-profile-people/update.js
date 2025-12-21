/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

/**
 * @swagger
 * /api/project-profile-people/{id}:
 *   patch:
 *     summary: Update a person's role in a profile field
 *     description: Updates the role of a user assigned to a people-type profile field
 *     tags:
 *       - Project Profile People
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *               position:
 *                 type: number
 *     responses:
 *       200:
 *         description: Person updated successfully
 *       404:
 *         description: Person assignment not found
 */
module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    role: {
      type: 'string',
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

    const person = await ProjectProfilePeople.findOne({
      id: inputs.id,
      isDeleted: false,
    });

    if (!person) {
      throw 'notFound';
    }

    const project = await Project.findOne({
      id: person.project,
    });

    if (!project) {
      throw 'notFound';
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager) {
      throw 'notFound';
    }

    const updateData = {};
    if (inputs.role !== undefined) {
      updateData.role = inputs.role;
    }
    if (inputs.position !== undefined) {
      updateData.position = inputs.position;
    }

    const updatedPerson = await ProjectProfilePeople.updateOne({ id: inputs.id }).set(updateData);

    const user = await User.findOne({ id: updatedPerson.user });

    return {
      item: {
        id: updatedPerson.id,
        userId: user ? user.id : null,
        user: user
          ? {
              id: user.id,
              name: user.name,
              username: user.username,
              email: user.email,
              avatarUrl: user.avatarUrl,
            }
          : null,
        role: updatedPerson.role,
        position: updatedPerson.position,
        fieldId: updatedPerson.field,
        projectId: updatedPerson.project,
      },
    };
  },
};
