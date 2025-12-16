/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      required: true,
    },
    sections: {
      type: 'json',
      defaultsTo: [],
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const profile = await ProjectProfile.create(inputs.values).fetch();

    const createdSections = [];
    const createdFields = [];

    if (inputs.sections && inputs.sections.length > 0) {
      for (let i = 0; i < inputs.sections.length; i += 1) {
        const sectionData = inputs.sections[i];
        const { fields, ...sectionValues } = sectionData;

        // Create section
        // eslint-disable-next-line no-await-in-loop
        const section = await ProjectProfileSection.create({
          ...sectionValues,
          profile: profile.id,
          position: sectionData.position !== undefined ? sectionData.position : i,
        }).fetch();

        createdSections.push({
          ...section,
          profileId: section.profile,
        });

        // Create fields for this section
        if (fields && Array.isArray(fields) && fields.length > 0) {
          for (let j = 0; j < fields.length; j += 1) {
            const fieldData = fields[j];
            // eslint-disable-next-line no-await-in-loop
            const field = await ProjectProfileField.create({
              ...fieldData,
              section: section.id,
              position: fieldData.position !== undefined ? fieldData.position : j,
            }).fetch();

            createdFields.push({
              ...field,
              sectionId: field.section,
            });
          }
        }
      }
    }

    // Broadcast to all admin/manager users
    const adminUsers = await User.find({
      or: [{ role: User.Roles.ADMIN }, { role: User.Roles.MANAGER }],
    });

    adminUsers.forEach((user) => {
      sails.sockets.broadcast(
        `user:${user.id}`,
        'projectProfileCreate',
        {
          item: {
            ...profile,
            projectId: profile.project || null,
            templateId: profile.template || null,
          },
          sections: createdSections,
          fields: createdFields,
        },
        inputs.request,
      );
    });

    return {
      profile: {
        ...profile,
        projectId: profile.project || null,
        templateId: profile.template || null,
      },
      sections: createdSections,
      fields: createdFields,
    };
  },
};
