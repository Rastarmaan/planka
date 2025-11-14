/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /boards/{boardId}/releases:
 *   get:
 *     summary: Get all releases for a board
 *     description: Retrieves all releases for a specific board that the current user has access to.
 *     tags:
 *       - Board Releases
 *     operationId: getBoardReleases
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the board
 *         example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Board releases retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - items
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/BoardRelease'
 *                       - type: object
 *                         properties:
 *                           epics:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                                 type:
 *                                   type: string
 *                           stories:
 *                             type: array
 *                             items:
 *                               type: object
 *                           cards:
 *                             type: array
 *                             items:
 *                               type: object
 *                           epicsCount:
 *                             type: number
 *                           storiesCount:
 *                             type: number
 *                           cardsCount:
 *                             type: number
 *                           totalCount:
 *                             type: number
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

module.exports = {
  inputs: {
    boardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const board = await Board.findOne(inputs.boardId);

    if (!board) {
      throw 'notFound';
    }

    const boardMembership = await BoardMembership.findOne({
      boardId: inputs.boardId,
      userId: currentUser.id,
    });

    const project = await Project.findOne(board.projectId).populate('managerUsers');
    const isProjectManager =
      project && project.managerUsers.some((managerUser) => managerUser.id === currentUser.id);

    if (!boardMembership && !isProjectManager && currentUser.role !== User.Roles.ADMIN) {
      throw 'forbidden';
    }

    const releases = await BoardRelease.find({
      boardId: inputs.boardId,
    }).sort('createdAt DESC');

    const releasesWithDetails = await Promise.all(
      releases.map(async (release) => {
        const releaseCards = await ReleaseCard.find({ releaseId: release.id });
        const cardIds = releaseCards.map((rc) => rc.cardId);

        if (cardIds.length === 0) {
          return {
            ...release,
            epics: [],
            stories: [],
            cards: [],
            epicsCount: 0,
            storiesCount: 0,
            cardsCount: 0,
            totalCount: 0,
            releaseCards: [],
          };
        }

        const cards = await Card.find({ id: cardIds });

        const epics = cards.filter((card) => card.type === Card.Types.EPIC);
        const stories = cards.filter((card) => card.type === Card.Types.STORY);
        const regularCards = cards.filter(
          (card) => card.type !== Card.Types.EPIC && card.type !== Card.Types.STORY,
        );

        return {
          ...release,
          epics: epics.map((epic) => ({
            id: epic.id,
            name: epic.name,
            type: epic.type,
          })),
          stories: stories.map((story) => ({
            id: story.id,
            name: story.name,
            type: story.type,
          })),
          cards: regularCards.map((card) => ({
            id: card.id,
            name: card.name,
            type: card.type,
          })),
          epicsCount: epics.length,
          storiesCount: stories.length,
          cardsCount: regularCards.length,
          totalCount: cards.length,
          releaseCards,
        };
      }),
    );

    return exits.success({
      items: releasesWithDetails,
    });
  },
};
