/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const path = require('path');
const { v4: uuid } = require('uuid');

module.exports = {
  inputs: {
    spaceId: {
      type: 'string',
      required: true,
    },
    folderId: {
      type: 'string',
      allowNull: true,
    },
    user: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const uploadedFiles = [];

    await new Promise((resolve, reject) => {
      inputs.request.file('files').upload(
        {
          saveAs(file, cb) {
            const extension = path.extname(file.filename);
            const filename = `${uuid()}${extension}`;
            cb(null, filename);
          },
          dirname:
            sails.config.custom.documentsPath ||
            path.resolve(sails.config.appPath, 'private/documents'),
        },
        // eslint-disable-next-line consistent-return
        (err, uploadedFileDescriptors) => {
          if (err) {
            return reject(err);
          }

          (async () => {
            try {
              /* eslint-disable no-await-in-loop, no-restricted-syntax */
              for (const fileDescriptor of uploadedFileDescriptors) {
                const extension = path.extname(fileDescriptor.filename);
                const originalName = fileDescriptor.filename;
                const filename = path.basename(fileDescriptor.fd);
                const storagePath = `private/documents/${filename}`;

                const documentFile = await DocumentFile.create({
                  name: originalName,
                  originalName,
                  space: inputs.spaceId,
                  folder: inputs.folderId || null,
                  size: fileDescriptor.size,
                  mimeType: fileDescriptor.type || 'application/octet-stream',
                  extension,
                  storagePath,
                  uploadedByUser: inputs.user.id,
                }).fetch();

                const version = await DocumentFileVersion.create({
                  file: documentFile.id,
                  versionNumber: 1,
                  name: originalName,
                  size: fileDescriptor.size,
                  storagePath,
                  uploadedByUser: inputs.user.id,
                }).fetch();

                await DocumentFile.updateOne({ id: documentFile.id }).set({
                  currentVersion: version.id,
                });

                sails.sockets.broadcast(`space:${inputs.spaceId}`, 'fileCreate', {
                  item: documentFile,
                });

                await sails.helpers.documentActivity.logOne.with({
                  user: inputs.user,
                  action: 'upload',
                  resourceType: 'file',
                  resourceId: documentFile.id,
                  resourceName: documentFile.name,
                  metadata: {
                    size: fileDescriptor.size,
                    mimeType: fileDescriptor.type,
                  },
                  request: inputs.request,
                });

                uploadedFiles.push(documentFile);
              }
              /* eslint-enable no-await-in-loop, no-restricted-syntax */

              resolve();
            } catch (error) {
              reject(error);
            }
          })();
        },
      );
    });

    return uploadedFiles;
  },
};
