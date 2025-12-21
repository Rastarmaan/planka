/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * ProjectProfilePeople.js
 *
 * @description :: Model for storing user-role assignments in project profile people fields
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    role: {
      type: 'string',
      defaultsTo: '',
    },
    position: {
      type: 'number',
      defaultsTo: 0,
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

    project: {
      model: 'Project',
      required: true,
      columnName: 'project_id',
    },
    field: {
      model: 'ProjectProfileField',
      required: true,
      columnName: 'field_id',
    },
    user: {
      model: 'User',
      required: true,
      columnName: 'user_id',
    },
  },

  tableName: 'project_profile_people',

  customToJSON() {
    return {
      id: this.id,
      projectId: this.project,
      fieldId: this.field,
      userId: this.user,
      role: this.role,
      position: this.position,
    };
  },
};
