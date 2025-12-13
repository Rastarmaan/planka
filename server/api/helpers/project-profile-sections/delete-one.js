/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const section = await ProjectProfileSection.updateOne(inputs.record.id).set({
      isDeleted: true,
    });

    if (!section) {
      return section;
    }

    // Also soft delete all fields in this section
    await ProjectProfileField.update({
      section: section.id,
    }).set({
      isDeleted: true,
    });

    // Broadcast to all admin/manager users
    const adminUsers = await User.find({
      or: [{ role: User.Roles.ADMIN }, { role: User.Roles.MANAGER }],
    });

    adminUsers.forEach((user) => {
      sails.sockets.broadcast(
        `user:${user.id}`,
        'projectProfileSectionDelete',
        {
          item: {
            ...section,
            profileId: section.profile,
          },
        },
        inputs.request,
      );
    });

    return {
      ...section,
      profileId: section.profile,
    };
  },
};
