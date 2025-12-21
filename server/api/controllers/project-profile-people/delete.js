/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

/**
 * @swagger
 * /api/project-profile-people/{id}:
 *   delete:
 *     summary: Remove a person from a profile field
 *     description: Removes a user assignment from a people-type profile field
 *     tags:
 *       - Project Profile People
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Person removed successfully
 *       404:
 *         description: Person assignment not found
 */
module.exports = {
  inputs: {
    id: {
      ...idInput,
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

    await ProjectProfilePeople.updateOne({ id: inputs.id }).set({ isDeleted: true });

    return {
      item: {
        id: person.id,
      },
    };
  },
};
