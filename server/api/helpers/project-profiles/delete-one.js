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
    const profile = await ProjectProfile.updateOne(inputs.record.id).set({
      isDeleted: true,
    });

    if (!profile) {
      return profile;
    }

    // Also soft delete all sections and fields
    await ProjectProfileSection.update({
      profile: profile.id,
    }).set({
      isDeleted: true,
    });

    const sections = await ProjectProfileSection.find({
      profile: profile.id,
    });

    const sectionIds = sections.map((s) => s.id);
    if (sectionIds.length > 0) {
      await ProjectProfileField.update({
        section: sectionIds,
      }).set({
        isDeleted: true,
      });
    }

    // Broadcast to all admin/manager users
    const adminUsers = await User.find({
      or: [{ role: User.Roles.ADMIN }, { role: User.Roles.MANAGER }],
    });

    adminUsers.forEach((user) => {
      sails.sockets.broadcast(
        `user:${user.id}`,
        'projectProfileDelete',
        {
          item: {
            ...profile,
            projectId: profile.project || null,
            templateId: profile.template || null,
          },
        },
        inputs.request,
      );
    });

    return {
      ...profile,
      projectId: profile.project || null,
      templateId: profile.template || null,
    };
  },
};
