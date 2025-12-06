/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /cards/import-and-sync:
 *   post:
 *     summary: Import and sync card
 *     description: Imports a card from another board/project with sync enabled. The imported card will sync all properties (dates, labels, members, description, etc.) with the source card bidirectionally. Sync stops when either card moves to a different list. Only admins and project managers can import cards.
 *     tags:
 *       - Cards
 *     operationId: importAndSyncCard
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sourceCardId
 *               - targetListId
 *               - position
 *             properties:
 *               sourceCardId:
 *                 type: string
 *                 description: ID of the source card to import from
 *                 example: "1357158568008091264"
 *               targetListId:
 *                 type: string
 *                 description: ID of the target list to import into
 *                 example: "1357158568008091265"
 *               position:
 *                 type: number
 *                 minimum: 0
 *                 description: Position for the imported card within the target list
 *                 example: 65536
 *               name:
 *                 type: string
 *                 maxLength: 1024
 *                 description: Optional custom name for the imported card (defaults to source card name)
 *                 example: Implement user authentication (imported)
 *     responses:
 *       200:
 *         description: Card imported and sync enabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *                 - included
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Card'
 *                 included:
 *                   type: object
 *                   properties:
 *                     cardMemberships:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CardMembership'
 *                     cardLabels:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CardLabel'
 *                     taskLists:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TaskList'
 *                     tasks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Task'
 *                     attachments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Attachment'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  SOURCE_CARD_NOT_FOUND: {
    sourceCardNotFound: 'Source card not found',
  },
  TARGET_LIST_NOT_FOUND: {
    targetListNotFound: 'Target list not found',
  },
  CANNOT_SYNC_WITH_SELF: {
    cannotSyncWithSelf: 'Cannot sync card with itself',
  },
};

module.exports = {
  inputs: {
    sourceCardId: {
      ...idInput,
      required: true,
    },
    targetListId: {
      ...idInput,
      required: true,
    },
    position: {
      type: 'number',
      min: 0,
      required: true,
    },
    name: {
      type: 'string',
      maxLength: 1024,
      allowNull: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    sourceCardNotFound: {
      responseType: 'notFound',
    },
    targetListNotFound: {
      responseType: 'notFound',
    },
    cannotSyncWithSelf: {
      responseType: 'badRequest',
    },
    sourceAlreadySynced: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const {
      card: sourceCard,
      board: sourceBoard,
      project: sourceProject,
    } = await sails.helpers.cards
      .getPathToProjectById(inputs.sourceCardId)
      .intercept('pathNotFound', () => Errors.SOURCE_CARD_NOT_FOUND);

    const targetList = await List.qm.getOneById(inputs.targetListId);
    if (!targetList) {
      throw Errors.TARGET_LIST_NOT_FOUND;
    }

    const targetBoard = await Board.findOne(targetList.boardId);
    const targetProject = await Project.findOne(targetBoard.projectId);

    if (sourceCard.listId === inputs.targetListId) {
      throw Errors.CANNOT_SYNC_WITH_SELF;
    }

    const isAdmin = currentUser.role === User.Roles.ADMIN;
    const isSourceProjectManager = await sails.helpers.users.isProjectManager(
      currentUser.id,
      sourceProject.id,
    );
    const isTargetProjectManager = await sails.helpers.users.isProjectManager(
      currentUser.id,
      targetProject.id,
    );

    if (!isAdmin && !isSourceProjectManager && !isTargetProjectManager) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const targetBoardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      targetBoard.id,
      currentUser.id,
    );

    const hasTargetEditorRights =
      isAdmin ||
      isTargetProjectManager ||
      (targetBoardMembership && targetBoardMembership.role === BoardMembership.Roles.EDITOR);

    if (!hasTargetEditorRights) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = {
      position: inputs.position,
      name: inputs.name || sourceCard.name,
      creatorUser: currentUser,
    };

    const {
      card: importedCard,
      cardMemberships,
      cardLabels,
      taskLists,
      tasks,
      attachments,
      customFieldGroups,
      customFields,
      customFieldValues,
    } = await sails.helpers.cards.duplicateOne.with({
      project: targetProject,
      board: targetBoard,
      list: targetList,
      record: sourceCard,
      values,
      request: this.req,
    });

    const updatedImportedCard = await Card.qm.updateOne(importedCard.id, {
      syncedFromCardId: sourceCard.id,
      isSyncEnabled: true,
    });

    const updatedSourceCard = await Card.qm.updateOne(sourceCard.id, {
      syncedFromCardId: importedCard.id,
      isSyncEnabled: true,
    });

    const sourceComments = await Comment.qm.getByCardId(sourceCard.id);
    const copiedComments = [];

    if (sourceComments.length > 0) {
      // eslint-disable-next-line no-restricted-syntax
      for (const sourceComment of sourceComments) {
        // eslint-disable-next-line no-await-in-loop
        const commentUser = await User.findOne({ id: sourceComment.userId });

        // eslint-disable-next-line no-await-in-loop
        const copiedComment = await sails.helpers.comments.createOne.with({
          project: targetProject,
          board: targetBoard,
          list: targetList,
          values: {
            card: updatedImportedCard.card,
            user: commentUser,
            text: sourceComment.text,
          },
          skipSync: true,
        });

        copiedComments.push(copiedComment);
      }
    }

    sails.sockets.broadcast(`board:${updatedImportedCard.card.boardId}`, 'cardUpdate', {
      item: updatedImportedCard.card,
    });

    sails.sockets.broadcast(`board:${sourceCard.boardId}`, 'cardUpdate', {
      item: updatedSourceCard.card,
    });

    await sails.helpers.actions.createOne.with({
      webhooks: await Webhook.qm.getAll(),
      values: {
        card: updatedImportedCard.card,
        type: Action.Types.CREATE_CARD,
        data: {
          card: _.pick(updatedImportedCard.card, ['name']),
          list: _.pick(targetList, ['id', 'type', 'name']),
          syncedFrom: {
            cardId: sourceCard.id,
            cardName: sourceCard.name,
            boardId: sourceBoard.id,
            boardName: sourceBoard.name,
          },
        },
        user: currentUser,
      },
      project: targetProject,
      board: targetBoard,
      list: targetList,
    });

    return {
      item: updatedImportedCard.card,
      included: {
        cardMemberships,
        cardLabels,
        taskLists,
        tasks,
        customFieldGroups,
        customFields,
        customFieldValues,
        attachments: sails.helpers.attachments.presentMany(attachments),
        comments: copiedComments,
      },
    };
  },
};
