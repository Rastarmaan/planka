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
    fields: {
      type: 'json',
      defaultsTo: [],
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const section = await ProjectProfileSection.create(inputs.values).fetch();

    const createdFields = [];

    if (inputs.fields && Array.isArray(inputs.fields) && inputs.fields.length > 0) {
      for (let i = 0; i < inputs.fields.length; i += 1) {
        const fieldData = inputs.fields[i];
        // eslint-disable-next-line no-await-in-loop
        const field = await ProjectProfileField.create({
          ...fieldData,
          section: section.id,
          position: fieldData.position !== undefined ? fieldData.position : i,
        }).fetch();

        createdFields.push({
          ...field,
          sectionId: field.section,
        });
      }
    }

    // Broadcast to all admin/manager users
    const adminUsers = await User.find({
      or: [{ role: User.Roles.ADMIN }, { role: User.Roles.MANAGER }],
    });

    adminUsers.forEach((user) => {
      sails.sockets.broadcast(
        `user:${user.id}`,
        'projectProfileSectionCreate',
        {
          item: {
            ...section,
            profileId: section.profile,
          },
          fields: createdFields,
        },
        inputs.request,
      );
    });

    return {
      section: {
        ...section,
        profileId: section.profile,
      },
      fields: createdFields,
    };
  },
};
