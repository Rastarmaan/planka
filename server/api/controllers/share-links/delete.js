/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /share-links/{id}:
 *   delete:
 *     summary: Revoke share link
 *     description: Deactivate a share link
 *     tags:
 *       - Share Links
 */

module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
      regex: /^\d+$/,
    },
  },

  async fn(inputs) {
    const shareLink = await ShareLink.findOne({ id: inputs.id });

    if (!shareLink) {
      throw 'notFound';
    }

    await ShareLink.update({ id: shareLink.id }).set({
      isActive: false,
    });

    return {
      item: shareLink,
    };
  },
};
