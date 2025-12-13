/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const mime = require('mime');

const filenamify = require('../../../utils/filenamify');

module.exports = {
  inputs: {
    file: {
      type: 'json',
      required: true,
    },
  },

  async fn(inputs) {
    const fileManager = sails.hooks['file-manager'].getInstance();

    const filename = filenamify(inputs.file.filename);
    const mimeType = mime.getType(filename);
    const { size } = inputs.file;

    const { id: uploadedFileId } = await UploadedFile.qm.createOne({
      mimeType,
      size,
      type: UploadedFile.Types.PROFILE_FILE,
    });

    const dirPathSegment = `${sails.config.custom.profileFilesPathSegment}/${uploadedFileId}`;

    await fileManager.move(inputs.file.fd, `${dirPathSegment}/${filename}`, inputs.file.type);

    return {
      uploadedFileId,
      filename,
      mimeType,
      size,
    };
  },
};
