/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /share-links/{id}:
 *   patch:
 *     summary: Update a share link
 *     description: Update settings for an existing share link
 *     tags:
 *       - Share Links
 */

const bcrypt = require('bcrypt');

module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
      regex: /^\d+$/,
    },
    isDownloadable: {
      type: 'boolean',
    },
    password: {
      type: 'string',
      allowNull: true,
    },
    expiresAt: {
      type: 'string',
      allowNull: true,
    },
    maxAccessCount: {
      type: 'number',
      allowNull: true,
    },
  },

  async fn(inputs) {
    const shareLink = await ShareLink.findOne({ id: inputs.id });

    if (!shareLink) {
      throw 'notFound';
    }

    const { currentUser } = this.req;
    if (shareLink.createdByUser !== currentUser.id && currentUser.role !== 'admin') {
      throw 'forbidden';
    }

    const updateData = {};

    if (inputs.isDownloadable !== undefined) {
      updateData.isDownloadable = inputs.isDownloadable;
    }

    if (inputs.password !== undefined) {
      if (inputs.password === null || inputs.password === '') {
        updateData.passwordHash = null;
        updateData.isPasswordProtected = false;
      } else {
        updateData.passwordHash = await bcrypt.hash(inputs.password, 10);
        updateData.isPasswordProtected = true;
      }
    }

    if (inputs.expiresAt !== undefined) {
      updateData.expiresAt = inputs.expiresAt ? new Date(inputs.expiresAt) : null;
    }

    if (inputs.maxAccessCount !== undefined) {
      updateData.maxAccessCount = inputs.maxAccessCount;
    }

    if (Object.keys(updateData).length > 0) {
      const setClauses = [];
      const values = [];
      let paramIndex = 1;

      Object.entries(updateData).forEach(([key, value]) => {
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        setClauses.push(`"${snakeKey}" = $${paramIndex}`);
        values.push(value);
        paramIndex += 1;
      });

      values.push(inputs.id);

      await sails.sendNativeQuery(
        `UPDATE share_link SET ${setClauses.join(', ')} WHERE id = $${paramIndex}`,
        values,
      );
    }

    const updatedLink = await ShareLink.findOne({ id: inputs.id });

    return {
      item: updatedLink,
    };
  },
};
