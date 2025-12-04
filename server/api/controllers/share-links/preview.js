/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /public/{token}/preview:
 *   get:
 *     summary: Preview file via public link
 *     description: Preview file (images only) via public share link - works even if download is disabled
 *     tags:
 *       - Public Access
 */

const bcrypt = require('bcrypt');

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

  exits: {
    notFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const shareLink = await ShareLink.findOne({ token: inputs.token, isActive: true });

    if (!shareLink) {
      throw 'notFound';
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

    if (shareLink.resourceType !== ShareLink.ResourceTypes.FILE) {
      return this.res.status(400).json({
        code: 'E_NOT_FILE',
        message: 'Only file previews are supported',
      });
    }

    const file = await DocumentFile.findOne({ id: shareLink.resourceId, isDeleted: false });

    if (!file) {
      throw 'notFound';
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      // Videos
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska',
      // Audio
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/aac',
      'audio/flac',
      'audio/x-m4a',
      'audio/mp4',
      // PDF
      'application/pdf',
      // Text and code files
      'text/plain',
      'text/markdown',
      'text/csv',
      'text/html',
      'text/css',
      'text/javascript',
      'text/xml',
      'application/json',
      'application/javascript',
      'application/xml',
      'application/x-javascript',
      'application/x-python',
      'application/x-python-code',
    ];

    const isTextMime = file.mimeType && file.mimeType.startsWith('text/');

    const codeExtensions = [
      'js',
      'ts',
      'jsx',
      'tsx',
      'py',
      'java',
      'c',
      'cpp',
      'h',
      'hpp',
      'cs',
      'go',
      'rb',
      'php',
      'swift',
      'kt',
      'rs',
      'scala',
      'vue',
      'json',
      'xml',
      'yaml',
      'yml',
      'toml',
      'ini',
      'cfg',
      'conf',
      'md',
      'markdown',
      'txt',
      'log',
      'csv',
      'tsv',
      'html',
      'htm',
      'css',
      'scss',
      'sass',
      'less',
      'sql',
      'sh',
      'bash',
      'zsh',
      'ps1',
      'bat',
      'cmd',
      'dockerfile',
      'makefile',
      'gitignore',
      'env',
    ];
    const fileExt = file.name ? file.name.split('.').pop().toLowerCase() : '';
    const isCodeFile = codeExtensions.includes(fileExt);

    if (!allowedMimeTypes.includes(file.mimeType) && !isTextMime && !isCodeFile) {
      return this.res.status(400).json({
        code: 'E_NOT_PREVIEWABLE',
        message: 'File type not supported for preview',
      });
    }

    const fileManager = sails.hooks['file-manager'].getInstance();
    const fileStream = await fileManager.read(file.storagePath);

    this.res.set('Content-Type', file.mimeType);
    this.res.set('Content-Disposition', `inline; filename="${file.name}"`);

    return fileStream;
  },
};
