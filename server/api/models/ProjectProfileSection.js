/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * ProjectProfileSection.js
 *
 * @description :: Model for sections within project profiles
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const Types = {
  TEAM: 'team',
  SOCIAL_MEDIA: 'social_media',
  BRIEF: 'brief',
  LOGO: 'logo',
  CUSTOM: 'custom',
};

module.exports = {
  Types,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    name: {
      type: 'string',
      required: true,
    },
    type: {
      type: 'string',
      isIn: Object.values(Types),
      defaultsTo: Types.CUSTOM,
    },
    description: {
      type: 'string',
      defaultsTo: '',
    },
    position: {
      type: 'number',
      required: true,
    },
    isDeleted: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'is_deleted',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    profile: {
      model: 'ProjectProfile',
      required: true,
      columnName: 'profile_id',
    },
    fields: {
      collection: 'ProjectProfileField',
      via: 'section',
    },
  },

  tableName: 'project_profile_section',

  customToJSON() {
    return {
      ...this,
      profileId: this.profile,
    };
  },
};
