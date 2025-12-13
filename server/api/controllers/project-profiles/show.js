/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /project-profiles/{id}:
 *   get:
 *     summary: Get a project profile
 *     description: Retrieves a single project profile with its sections and fields
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
 *         description: Profile retrieved successfully
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

    const sections = await ProjectProfileSection.find({
      profile: profile.id,
      isDeleted: false,
    }).sort('position ASC');

    const sectionIds = sections.map((s) => s.id);
    const fields =
      sectionIds.length > 0
        ? await ProjectProfileField.find({
            section: sectionIds,
            isDeleted: false,
          }).sort('position ASC')
        : [];

    return {
      item: {
        ...profile,
        projectId: profile.project || null,
        templateId: profile.template || null,
      },
      included: {
        projectProfileSections: sections.map((s) => ({
          ...s,
          profileId: s.profile,
        })),
        projectProfileFields: fields.map((f) => ({
          ...f,
          sectionId: f.section,
        })),
      },
    };
  },
};
