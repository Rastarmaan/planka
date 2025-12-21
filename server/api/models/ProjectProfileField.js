/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * ProjectProfileField.js
 *
 * @description :: Model for dynamic fields within profile sections
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const FieldTypes = {
  TEXT: 'text',
  EMAIL: 'email',
  DATE: 'date',
  FILE: 'file',
  NUMBER: 'number',
  PEOPLE: 'people',
  LINK: 'link',
};

module.exports = {
  FieldTypes,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    fieldType: {
      type: 'string',
      isIn: Object.values(FieldTypes),
      defaultsTo: FieldTypes.TEXT,
      columnName: 'field_type',
    },
    label: {
      type: 'string',
      required: true,
    },
    value: {
      type: 'string',
      defaultsTo: '',
    },
    metadata: {
      type: 'json',
      defaultsTo: {},
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

    section: {
      model: 'ProjectProfileSection',
      required: true,
      columnName: 'section_id',
    },
  },

  tableName: 'project_profile_field',

  customToJSON() {
    return {
      ...this,
      type: this.fieldType,
      sectionId: this.section,
      isRequired: (this.metadata && this.metadata.isRequired) || false,
      options: (this.metadata && this.metadata.options) || '',
    };
  },
};
