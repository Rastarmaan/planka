/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /project-profiles/{id}:
 *   delete:
 *     summary: Delete a project profile
 *     description: Soft deletes a project profile and all its sections and fields
 *     tags:
 *       - Project Profiles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile deleted successfully
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

    const profile = await ProjectProfile.findOne({
      id: inputs.id,
      isDeleted: false,
    });

    if (!profile) {
      throw 'notFound';
    }

    const deletedProfile = await sails.helpers.projectProfiles.deleteOne.with({
      record: profile,
      request: this.req,
    });

    return {
      item: deletedProfile,
    };
  },
};
