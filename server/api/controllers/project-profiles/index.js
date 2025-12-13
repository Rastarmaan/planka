/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /project-profiles:
 *   get:
 *     summary: Get all project profiles
 *     description: Retrieves all project profiles with their sections and fields
 *     tags:
 *       - Project Profiles
 *     responses:
 *       200:
 *         description: Project profiles retrieved successfully
 */

module.exports = {
  inputs: {},

  exits: {
    notFound: {
      responseType: 'notFound',
    },
  },

  async fn() {
    const { currentUser } = this.req;

    if (!User.isAdminLevel(currentUser)) {
      throw 'notFound';
    }

    const profiles = await ProjectProfile.find({
      isDeleted: false,
    }).sort('createdAt DESC');

    const sections = await ProjectProfileSection.find({
      isDeleted: false,
    }).sort('position ASC');

    const fields = await ProjectProfileField.find({
      isDeleted: false,
    }).sort('position ASC');

    return {
      items: profiles.map((p) => ({
        ...p,
        projectId: p.project || null,
        templateId: p.template || null,
      })),
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
