/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /document-activities:
 *   get:
 *     summary: Get document activities
 *     description: Retrieves a list of document activities (activity history) with pagination support.
 *     tags:
 *       - Document Activities
 *     operationId: getDocumentActivities
 *     parameters:
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Number of activities to return (default 20)
 *         schema:
 *           type: integer
 *           example: 20
 *       - name: skip
 *         in: query
 *         required: false
 *         description: Number of activities to skip (for pagination)
 *         schema:
 *           type: integer
 *           example: 0
 *       - name: excludeActions
 *         in: query
 *         required: false
 *         description: Actions to exclude from results
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           example: ["download"]
 *     responses:
 *       200:
 *         description: Document activities retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   description: List of document activities
 *                   items:
 *                     $ref: '#/components/schemas/DocumentActivity'
 *                 total:
 *                   type: integer
 *                   description: Total count of activities
 *                 included:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       description: Related users
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

module.exports = {
  inputs: {
    limit: {
      type: 'number',
      defaultsTo: 20,
      min: 1,
      max: 100,
    },
    skip: {
      type: 'number',
      defaultsTo: 0,
      min: 0,
    },
    excludeActions: {
      type: 'json',
      defaultsTo: [],
    },
    spaceId: {
      type: 'string',
      allowNull: true,
    },
  },

  exits: {
    forbidden: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (currentUser.role !== User.Roles.ADMIN) {
      throw 'forbidden';
    }

    const allSpaces = await Space.find({
      isDeleted: false,
    });
    const allSpaceIds = allSpaces.map((s) => String(s.id));

    // Build query criteria
    const criteria = {};

    if (inputs.excludeActions && inputs.excludeActions.length > 0) {
      criteria.action = { '!': inputs.excludeActions };
    }

    if (inputs.spaceId) {
      criteria.space = inputs.spaceId;
    } else {
      if (allSpaceIds.length === 0) {
        return {
          items: [],
          total: 0,
          included: { users: [] },
        };
      }
      criteria.space = allSpaceIds;
    }

    // Get activities with pagination
    const [activities, totalCount] = await Promise.all([
      DocumentActivity.find(criteria)
        .populate('user')
        .populate('space')
        .sort('createdAt DESC')
        .limit(inputs.limit)
        .skip(inputs.skip),
      DocumentActivity.count(criteria),
    ]);

    // Get unique user IDs from populated user objects
    const userIds = activities
      .map((activity) => (activity.user ? activity.user.id : null))
      .filter((id) => id !== null);
    const uniqueUserIds = [...new Set(userIds)];
    const users = uniqueUserIds.length > 0 ? await User.find({ id: uniqueUserIds }) : [];

    const userMap = {};
    users.forEach((user) => {
      userMap[user.id] = user;
    });

    const enrichedActivities = activities.map((activity) => {
      const activityObj = { ...activity };
      if (activity.user && activity.user.id && userMap[activity.user.id]) {
        activityObj.user = {
          id: userMap[activity.user.id].id,
          name: userMap[activity.user.id].name,
          username: userMap[activity.user.id].username,
          avatarUrl: userMap[activity.user.id].avatarUrl,
        };
      }
      return activityObj;
    });

    return {
      items: enrichedActivities,
      total: totalCount,
      included: {
        users: sails.helpers.users.presentMany(users, currentUser),
      },
    };
  },
};
