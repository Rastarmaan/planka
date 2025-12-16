/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  FILE_NOT_FOUND: {
    fileNotFound: 'File not found',
  },
};

module.exports = {
  inputs: {
    uploadedFileId: {
      ...idInput,
      required: true,
    },
    filename: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    fileNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs, exits) {
    const uploadedFile = await UploadedFile.qm.findOneById(inputs.uploadedFileId);

    if (!uploadedFile || uploadedFile.type !== UploadedFile.Types.PROFILE_FILE) {
      throw Errors.FILE_NOT_FOUND;
    }

    const fileManager = sails.hooks['file-manager'].getInstance();

    const filePath = await fileManager.get(
      `${sails.config.custom.profileFilesPathSegment}/${uploadedFile.id}/${inputs.filename}`,
    );

    if (!filePath) {
      throw Errors.FILE_NOT_FOUND;
    }

    this.res.type(uploadedFile.mimeType);
    this.res.set('Content-Disposition', `inline; filename="${inputs.filename}"`);

    return exits.success(filePath);
  },
};
