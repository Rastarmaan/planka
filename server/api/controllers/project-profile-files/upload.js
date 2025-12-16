/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
  NO_FILE_WAS_UPLOADED: {
    noFileWasUploaded: 'No file was uploaded',
  },
};

module.exports = {
  inputs: {
    projectId: {
      ...idInput,
      required: true,
    },
    fieldId: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    projectNotFound: {
      responseType: 'notFound',
    },
    noFileWasUploaded: {
      responseType: 'unprocessableEntity',
    },
    uploadError: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    // Verify project exists and user has access
    const project = await Project.qm.findOneById(inputs.projectId);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    // Check if user is admin or has access to the project
    if (!User.isAdminLevel(currentUser)) {
      const projectMembership = await ProjectMembership.qm.getOneByProjectIdAndUserId(
        project.id,
        currentUser.id,
      );

      if (!projectMembership) {
        throw Errors.PROJECT_NOT_FOUND; // Forbidden
      }
    }

    // Receive uploaded file
    let files;
    try {
      files = await sails.helpers.utils.receiveFile(this.req.file('file'));
    } catch (error) {
      return exits.uploadError(error.message);
    }

    if (files.length === 0) {
      throw Errors.NO_FILE_WAS_UPLOADED;
    }

    const file = _.last(files);

    // Process the uploaded file
    const data = await sails.helpers.projectProfileFiles.processUploadedFile(file);

    return exits.success({
      item: data,
    });
  },
};
