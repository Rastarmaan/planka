/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  tableName: 'project_history',

  attributes: {
    text: {
      type: 'string',
      required: true,
      maxLength: 4096,
      columnName: 'text',
    },

    project: {
      model: 'Project',
      required: true,
      columnName: 'project_id',
    },

    createdByUser: {
      model: 'User',
      columnName: 'created_by_user_id',
    },
  },

  customToJSON() {
    return {
      ...this,
      projectId: typeof this.project === 'object' ? this.project.id : this.project,
      createdByUserId:
        typeof this.createdByUser === 'object' ? this.createdByUser.id : this.createdByUser,
    };
  },
};
