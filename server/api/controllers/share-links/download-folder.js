/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /public/{token}/download-folder:
 *   get:
 *     summary: Download folder as ZIP via public link
 *     description: Download entire folder contents as ZIP archive via public share link
 *     tags:
 *       - Public Access
 */

const bcrypt = require('bcrypt');
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

async function getAllFilesInSpace(spaceId) {
  const rootFiles = await DocumentFile.find({ spaceId, folder: null, isDeleted: false });
  const allFiles = rootFiles.map((f) => ({ ...f, relativePath: f.name }));

  const rootFolders = await DocumentFolder.find({ spaceId, parentFolder: null, isDeleted: false });

  await Promise.all(
    rootFolders.map(async (folder) => {
      const subFiles = await getAllFilesInFolder(folder.id);
      subFiles.forEach((f) => {
        allFiles.push({
          ...f,
          relativePath: `${folder.name}/${f.relativePath}`,
        });
      });
    }),
  );

  return allFiles;
}

module.exports = {
  inputs: {
    token: {
      type: 'string',
      required: true,
    },
    password: {
      type: 'string',
      allowNull: true,
    },
  },

  async fn(inputs) {
    const shareLink = await ShareLink.findOne({ token: inputs.token, isActive: true });

    if (!shareLink) {
      throw 'notFound';
    }

    if (!shareLink.isDownloadable) {
      return this.res.status(400).json({
        code: 'E_DOWNLOAD_DISABLED',
        message: 'Download not allowed for this link',
      });
    }

    if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
      return this.res.status(400).json({
        code: 'E_EXPIRED',
        message: 'Share link has expired',
      });
    }

    if (shareLink.maxAccessCount && shareLink.accessCount >= shareLink.maxAccessCount) {
      return this.res.status(400).json({
        code: 'E_ACCESS_LIMIT',
        message: 'Share link access limit reached',
      });
    }

    if (shareLink.isPasswordProtected) {
      if (!inputs.password) {
        return this.res.status(400).json({
          code: 'E_PASSWORD_REQUIRED',
          message: 'Password required',
        });
      }

      const isPasswordValid = await bcrypt.compare(inputs.password, shareLink.passwordHash);
      if (!isPasswordValid) {
        return this.res.status(400).json({
          code: 'E_INVALID_PASSWORD',
          message: 'Invalid password',
        });
      }
    }

    if (
      shareLink.resourceType !== ShareLink.ResourceTypes.FOLDER &&
      shareLink.resourceType !== ShareLink.ResourceTypes.SPACE
    ) {
      return this.res.status(400).json({
        code: 'E_NOT_FOLDER',
        message: 'Only folder and space downloads are supported',
      });
    }

    let resource;
    let allFiles;
    let zipFileName;
    let spaceId;

    if (shareLink.resourceType === ShareLink.ResourceTypes.FOLDER) {
      resource = await DocumentFolder.findOne({ id: shareLink.resourceId, isDeleted: false });
      if (!resource) {
        throw 'notFound';
      }
      allFiles = await getAllFilesInFolder(resource.id);
      zipFileName = `${resource.name}.zip`;
      spaceId = resource.space;
    } else {
      resource = await Space.findOne({ id: shareLink.resourceId, isDeleted: false });
      if (!resource) {
        throw 'notFound';
      }
      allFiles = await getAllFilesInSpace(resource.id);
      zipFileName = `${resource.name}.zip`;
      spaceId = resource.id;
    }

    if (allFiles.length === 0) {
      return this.res.status(400).json({
        code: 'E_EMPTY_FOLDER',
        message: 'No files to download',
      });
    }

    await sails.sendNativeQuery(
      'UPDATE share_link SET access_count = $1, last_accessed_at = $2 WHERE id = $3',
      [shareLink.accessCount + 1, new Date().toISOString(), shareLink.id],
    );

    await sails.helpers.documentActivity.logOne.with({
      user: null,
      action: 'download',
      resourceType: shareLink.resourceType,
      resourceId: shareLink.resourceId,
      resourceName: resource.name,
      spaceId: spaceId ? String(spaceId) : null,
      metadata: {
        shareLinkId: shareLink.id,
        public: true,
        isZip: true,
        fileCount: allFiles.length,
      },
      request: this.req,
    });

    this.res.set('Content-Type', 'application/zip');
    this.res.set('Content-Disposition', `attachment; filename="${zipFileName}"`);

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
