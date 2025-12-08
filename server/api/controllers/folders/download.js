/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /folders/{id}/download:
 *   get:
 *     summary: Download folder as ZIP
 *     description: Download entire folder contents as ZIP archive
 *     tags:
 *       - Folders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Folder ID
 *     responses:
 *       200:
 *         description: ZIP file containing folder contents
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Folder not found
 */

const archiver = require('archiver');
const { PassThrough } = require('stream');

async function getAllFilesInFolder(folderId) {
  const files = await DocumentFile.find({ folder: folderId, isDeleted: false });
  const subFolders = await DocumentFolder.find({ parentFolder: folderId, isDeleted: false });

  const allFiles = files.map((f) => ({ ...f, relativePath: f.name }));

  await Promise.all(
    subFolders.map(async (subFolder) => {
      const subFiles = await getAllFilesInFolder(subFolder.id);
      subFiles.forEach((f) => {
        allFiles.push({
          ...f,
          relativePath: `${subFolder.name}/${f.relativePath}`,
        });
      });
    }),
  );

  return allFiles;
}

module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    notFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const folder = await DocumentFolder.findOne({ id: inputs.id, isDeleted: false });

    if (!folder) {
      throw 'notFound';
    }

    // Check if user has access to the space
    const space = await Space.findOne({ id: folder.space });
    if (!space) {
      throw 'notFound';
    }

    // Get all files in the folder
    const allFiles = await getAllFilesInFolder(folder.id);

    if (allFiles.length === 0) {
      return this.res.status(400).json({
        code: 'E_EMPTY_FOLDER',
        message: 'No files to download',
      });
    }

    // Log the download activity
    await sails.helpers.documentActivity.logOne.with({
      user: currentUser.id,
      action: 'download',
      resourceType: 'folder',
      resourceId: folder.id,
      resourceName: folder.name,
      spaceId: String(folder.space),
      metadata: {
        isZip: true,
        fileCount: allFiles.length,
      },
      request: this.req,
    });

    const zipFileName = `${folder.name}.zip`;

    this.res.set('Content-Type', 'application/zip');
    this.res.set(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(zipFileName)}"`,
    );

    const archive = archiver('zip', {
      zlib: { level: 5 },
    });

    const passThrough = new PassThrough();
    archive.pipe(passThrough);

    archive.on('error', (err) => {
      sails.log.error('Archive error:', err);
    });

    const fileManager = sails.hooks['file-manager'].getInstance();

    const addFilesToArchive = async () => {
      // eslint-disable-next-line no-restricted-syntax
      for (const file of allFiles) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const fileStream = await fileManager.read(file.storagePath);
          archive.append(fileStream, { name: file.relativePath });
        } catch (err) {
          sails.log.error(`Error reading file ${file.name}:`, err);
        }
      }
      archive.finalize();
    };

    addFilesToArchive();

    return passThrough;
  },
};
