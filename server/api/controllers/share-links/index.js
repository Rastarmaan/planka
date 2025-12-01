/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    resourceType: {
      type: 'string',
      required: true,
      isIn: ['space', 'folder', 'file'],
    },
    resourceId: {
      type: 'string',
      required: true,
      regex: /^\d+$/,
    },
  },

  async fn(inputs) {
    const shareLinks = await ShareLink.find({
      resourceType: inputs.resourceType,
      resourceId: inputs.resourceId,
      isActive: true,
    }).sort('createdAt DESC');

    return {
      items: shareLinks,
    };
  },
};
