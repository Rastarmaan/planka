/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /projects/{projectId}/boards/import:
 *   post:
 *     summary: Import board from another project with sync
 *     description: Import a board from another project and optionally enable real-time synchronization
 *     tags:
 *       - Boards
 *     operationId: importBoard
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: Target project ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sourceBoardId
 *             properties:
 *               sourceBoardId:
 *                 type: string
 *                 description: Source board ID to import from
 *               name:
 *                 type: string
 *                 nullable: true
 *                 description: Optional new board name (defaults to source name)
 *               enableSync:
 *                 type: boolean
 *                 default: false
 *                 description: Enable real-time synchronization
 *               syncDirection:
 *                 type: string
 *                 enum: [bidirectional, one-way]
 *                 default: bidirectional
 *                 description: Sync direction (one-way = source to target only)
 *               includeOptions:
 *                 type: object
 *                 properties:
 *                   cards:
 *                     type: boolean
 *                     default: true
 *                   members:
 *                     type: boolean
 *                     default: true
 *                   labels:
 *                     type: boolean
 *                     default: true
 *     responses:
 *       200:
 *         description: Board imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Board'
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  PROJECT_NOT_FOUND: { projectNotFound: 'Project not found' },
  BOARD_NOT_FOUND: { boardNotFound: 'Source board not found' },
  NOT_ENOUGH_RIGHTS: { notEnoughRights: 'Not enough rights' },
};

module.exports = {
  inputs: {
    projectId: { ...idInput, required: true },
    sourceBoardId: { ...idInput, required: true },
    name: { type: 'string', maxLength: 255 },
    enableSync: { type: 'boolean', defaultsTo: false },
    syncDirection: {
      type: 'string',
      isIn: ['bidirectional', 'one-way', 'none'],
      defaultsTo: 'bidirectional',
    },
    includeOptions: {
      type: 'json',
      custom: (value) => {
        if (!value || typeof value !== 'object') return true;
        return true;
      },
    },
  },

  exits: {
    projectNotFound: { responseType: 'notFound' },
    boardNotFound: { responseType: 'notFound' },
    notEnoughRights: { responseType: 'forbidden' },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const targetProject = await Project.findOne({ id: inputs.projectId });
    if (!targetProject) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const targetProjectManager = await ProjectManager.qm.getOneByProjectIdAndUserId(
      targetProject.id,
      currentUser.id,
    );

    if (!targetProjectManager) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const { board: sourceBoard } = await sails.helpers.boards
      .getPathToProjectById(inputs.sourceBoardId)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    const sourceBoardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      sourceBoard.id,
      currentUser.id,
    );

    if (!sourceBoardMembership) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const options = inputs.includeOptions || {
      cards: true,
      members: true,
      labels: true,
    };

    let cardMapping = null;

    const newBoardName = inputs.name || `${sourceBoard.name}`;

    const maxBoard = await Board.find({ projectId: targetProject.id })
      .sort('position DESC')
      .limit(1);
    const nextPosition = (maxBoard[0] && maxBoard[0].position + 65536) || 65536;

    const newBoard = await Board.create({
      id: (await sails.helpers.utils.generateIds(1))[0],
      projectId: targetProject.id,
      position: nextPosition,
      name: newBoardName,
      type: sourceBoard.type,
      calendarType: sourceBoard.calendarType,
      defaultView: sourceBoard.defaultView,
      defaultCardType: sourceBoard.defaultCardType,
      alwaysDisplayCardCreator: sourceBoard.alwaysDisplayCardCreator,
      limitCardTypesToDefaultOne: sourceBoard.limitCardTypesToDefaultOne,
      expandTaskListsByDefault: sourceBoard.expandTaskListsByDefault,
    }).fetch();

    await BoardMembership.create({
      id: (await sails.helpers.utils.generateIds(1))[0],
      projectId: targetProject.id,
      boardId: newBoard.id,
      userId: currentUser.id,
      role: 'editor',
      canComment: true,
    });

    const sourceLabels = await Label.find({ boardId: sourceBoard.id });
    const labelMapping = {};

    if (options.labels !== false) {
      /* eslint-disable no-await-in-loop, no-restricted-syntax */
      for (const sourceLabel of sourceLabels) {
        const newLabel = await Label.create({
          id: (await sails.helpers.utils.generateIds(1))[0],
          boardId: newBoard.id,
          position: sourceLabel.position,
          name: sourceLabel.name,
          color: sourceLabel.color,
        }).fetch();
        labelMapping[sourceLabel.id] = newLabel.id;
      }
      /* eslint-enable no-await-in-loop, no-restricted-syntax */
    }

    const sourceCustomFieldGroups = await CustomFieldGroup.find({
      boardId: sourceBoard.id,
    }).sort('position ASC');
    const customFieldGroupMapping = {};
    const customFieldMapping = {};

    /* eslint-disable no-await-in-loop, no-restricted-syntax */
    for (const sourceGroup of sourceCustomFieldGroups) {
      const newGroup = await CustomFieldGroup.create({
        id: (await sails.helpers.utils.generateIds(1))[0],
        boardId: newBoard.id,
        position: sourceGroup.position,
        name: sourceGroup.name,
      }).fetch();
      customFieldGroupMapping[sourceGroup.id] = newGroup.id;

      const sourceCustomFields = await CustomField.find({
        customFieldGroupId: sourceGroup.id,
      }).sort('position ASC');

      for (const sourceCustomField of sourceCustomFields) {
        const newCustomField = await CustomField.create({
          id: (await sails.helpers.utils.generateIds(1))[0],
          boardId: newBoard.id,
          customFieldGroupId: newGroup.id,
          position: sourceCustomField.position,
          name: sourceCustomField.name,
          type: sourceCustomField.type,
        }).fetch();
        customFieldMapping[sourceCustomField.id] = newCustomField.id;
      }
    }
    /* eslint-enable no-await-in-loop, no-restricted-syntax */

    const sourceLists = await List.find({ boardId: sourceBoard.id }).sort('position ASC');
    const listMapping = {};

    /* eslint-disable no-await-in-loop, no-restricted-syntax */
    for (const sourceList of sourceLists) {
      const newList = await List.create({
        id: (await sails.helpers.utils.generateIds(1))[0],
        boardId: newBoard.id,
        position: sourceList.position,
        name: sourceList.name,
        type: sourceList.type,
        color: sourceList.color,
      }).fetch();
      listMapping[sourceList.id] = newList.id;
    }
    /* eslint-enable no-await-in-loop, no-restricted-syntax */

    if (options.cards !== false) {
      let sourceCards = await Card.find({ boardId: sourceBoard.id });
      sourceCards = sourceCards.sort((a, b) => {
        if (a.position === null && b.position === null)
          return new Date(a.createdAt) - new Date(b.createdAt);
        if (a.position === null) return 1;
        if (b.position === null) return -1;
        if (a.position !== b.position) return a.position - b.position;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      cardMapping = {};

      /* eslint-disable no-await-in-loop, no-restricted-syntax */
      for (const sourceCard of sourceCards) {
        const newCard = await Card.create({
          id: (await sails.helpers.utils.generateIds(1))[0],
          boardId: newBoard.id,
          listId: listMapping[sourceCard.listId],
          creatorUserId: currentUser.id,
          position: sourceCard.position,
          name: sourceCard.name,
          description: sourceCard.description,
          dueDate: sourceCard.dueDate,
          startDate: sourceCard.startDate,
          stopwatch: sourceCard.stopwatch,
          isDueCompleted: sourceCard.isDueCompleted,
          isClosed: sourceCard.isClosed,
          type: sourceCard.type,
          prevListId: sourceCard.prevListId ? listMapping[sourceCard.prevListId] : null,
        }).fetch();
        cardMapping[sourceCard.id] = newCard.id;

        const sourceCardLabels = await CardLabel.find({ cardId: sourceCard.id });
        for (const sourceCardLabel of sourceCardLabels) {
          if (labelMapping[sourceCardLabel.labelId]) {
            await CardLabel.create({
              id: (await sails.helpers.utils.generateIds(1))[0],
              cardId: newCard.id,
              labelId: labelMapping[sourceCardLabel.labelId],
            });
          }
        }
      }

      for (const sourceCard of sourceCards) {
        if (sourceCard.parentCardId && cardMapping[sourceCard.parentCardId]) {
          await Card.updateOne({ id: cardMapping[sourceCard.id] }).set({
            parentCardId: cardMapping[sourceCard.parentCardId],
          });
        }
      }

      for (const sourceCard of sourceCards) {
        const newCardId = cardMapping[sourceCard.id];

        const sourceCardMemberships = await CardMembership.find({ cardId: sourceCard.id });
        for (const sourceCardMembership of sourceCardMemberships) {
          const isBoardMember = await BoardMembership.findOne({
            boardId: newBoard.id,
            userId: sourceCardMembership.userId,
          });

          if (isBoardMember) {
            await CardMembership.create({
              id: (await sails.helpers.utils.generateIds(1))[0],
              cardId: newCardId,
              userId: sourceCardMembership.userId,
            });
          }
        }

        const sourceTaskLists = await TaskList.find({ cardId: sourceCard.id }).sort('position ASC');
        for (const sourceTaskList of sourceTaskLists) {
          const newTaskList = await TaskList.create({
            id: (await sails.helpers.utils.generateIds(1))[0],
            cardId: newCardId,
            position: sourceTaskList.position,
            name: sourceTaskList.name,
          }).fetch();

          const sourceTasks = await Task.find({ taskListId: sourceTaskList.id }).sort(
            'position ASC',
          );
          for (const sourceTask of sourceTasks) {
            await Task.create({
              id: (await sails.helpers.utils.generateIds(1))[0],
              taskListId: newTaskList.id,
              position: sourceTask.position,
              name: sourceTask.name,
              isCompleted: sourceTask.isCompleted,
              cardId: sourceTask.cardId ? cardMapping[sourceTask.cardId] : null,
            });
          }
        }

        const sourceAttachments = await Attachment.find({ cardId: sourceCard.id }).sort(
          'createdAt ASC',
        );
        const attachmentMapping = {};

        for (const sourceAttachment of sourceAttachments) {
          const newAttachment = await Attachment.create({
            id: (await sails.helpers.utils.generateIds(1))[0],
            cardId: newCardId,
            creatorUserId: currentUser.id,
            name: sourceAttachment.name,
            dirname: sourceAttachment.dirname,
            image: sourceAttachment.image,
          }).fetch();
          attachmentMapping[sourceAttachment.id] = newAttachment.id;

          if (sourceAttachment.dirname) {
            try {
              // eslint-disable-next-line global-require
              const fs = require('fs').promises;
              // eslint-disable-next-line global-require
              const path = require('path');
              const sourceDir = path.join(
                sails.config.custom.attachmentsPath,
                sourceAttachment.dirname,
              );
              const targetDir = path.join(
                sails.config.custom.attachmentsPath,
                sourceAttachment.dirname,
              );

              const sourceFilePath = path.join(sourceDir, sourceAttachment.name);
              try {
                await fs.access(sourceFilePath);
                await fs.mkdir(targetDir, { recursive: true });
                const targetFilePath = path.join(targetDir, sourceAttachment.name);
                await fs.copyFile(sourceFilePath, targetFilePath);

                if (sourceAttachment.image) {
                  const sourceCoverPath = path.join(
                    sourceDir,
                    `cover.${sourceAttachment.image.extension}`,
                  );
                  try {
                    await fs.access(sourceCoverPath);
                    const targetCoverPath = path.join(
                      targetDir,
                      `cover.${sourceAttachment.image.extension}`,
                    );
                    await fs.copyFile(sourceCoverPath, targetCoverPath);
                  } catch (err) {
                    // Thumbnail doesn't exist, skip
                  }
                }
              } catch (err) {
                // Source file doesn't exist, skip copying
                // Attachment file not found; continue without logging
              }
            } catch (err) {
              // Error copying attachment file; continue without logging
            }
          }
        }

        if (sourceCard.coverAttachmentId && attachmentMapping[sourceCard.coverAttachmentId]) {
          await Card.updateOne({ id: newCardId }).set({
            coverAttachmentId: attachmentMapping[sourceCard.coverAttachmentId],
          });
        }

        const sourceCustomFieldValues = await CustomFieldValue.find({ cardId: sourceCard.id });
        for (const sourceCustomFieldValue of sourceCustomFieldValues) {
          const newCustomFieldId = customFieldMapping[sourceCustomFieldValue.customFieldId];

          if (newCustomFieldId) {
            await CustomFieldValue.create({
              id: (await sails.helpers.utils.generateIds(1))[0],
              cardId: newCardId,
              customFieldId: newCustomFieldId,
              value: sourceCustomFieldValue.value,
            });
          }
        }

        const sourceComments = await Comment.find({ cardId: sourceCard.id }).sort('createdAt ASC');
        for (const sourceComment of sourceComments) {
          await Comment.create({
            id: (await sails.helpers.utils.generateIds(1))[0],
            cardId: newCardId,
            userId: sourceComment.userId,
            text: sourceComment.text,
          });
        }
      }

      for (const sourceCard of sourceCards) {
        const newCardId = cardMapping[sourceCard.id];

        const sourceCardDependencies = await CardDependency.find({ cardId: sourceCard.id });
        for (const sourceCardDependency of sourceCardDependencies) {
          if (cardMapping[sourceCardDependency.dependsOnCardId]) {
            await CardDependency.create({
              id: (await sails.helpers.utils.generateIds(1))[0],
              cardId: newCardId,
              dependsOnCardId: cardMapping[sourceCardDependency.dependsOnCardId],
            });
          }
        }
      }
      /* eslint-enable no-await-in-loop, no-restricted-syntax */
    }

    if (options.members !== false) {
      const sourceBoardMemberships = await BoardMembership.find({ boardId: sourceBoard.id });

      /* eslint-disable no-await-in-loop, no-restricted-syntax, no-continue */
      for (const sourceMembership of sourceBoardMemberships) {
        if (sourceMembership.userId === currentUser.id) {
          continue; // Already added
        }

        const user = await User.findOne({ id: sourceMembership.userId });
        if (!user) {
          continue; // User doesn't exist, skip
        }

        let userProjectManager = await ProjectManager.findOne({
          projectId: targetProject.id,
          userId: sourceMembership.userId,
        });

        if (!userProjectManager) {
          userProjectManager = await ProjectManager.create({
            id: (await sails.helpers.utils.generateIds(1))[0],
            projectId: targetProject.id,
            userId: sourceMembership.userId,
          }).fetch();
        }

        await BoardMembership.create({
          id: (await sails.helpers.utils.generateIds(1))[0],
          projectId: targetProject.id,
          boardId: newBoard.id,
          userId: sourceMembership.userId,
          role: sourceMembership.role,
          canComment: sourceMembership.canComment,
        });
      }
      /* eslint-enable no-await-in-loop, no-restricted-syntax, no-continue */
    }

    if (inputs.enableSync && inputs.syncDirection !== 'none') {
      const boardLink = await BoardLink.create({
        id: (await sails.helpers.utils.generateIds(1))[0],
        sourceBoardId: sourceBoard.id,
        linkedBoardId: newBoard.id,
        syncEnabled: true,
        syncDirection: inputs.syncDirection,
      }).fetch();

      /* eslint-disable no-await-in-loop, no-restricted-syntax */
      for (const [sourceListId, targetListId] of Object.entries(listMapping)) {
        await SyncMapping.create({
          id: (await sails.helpers.utils.generateIds(1))[0],
          boardLinkId: boardLink.id,
          entityType: 'list',
          sourceEntityId: sourceListId,
          targetEntityId: targetListId,
        });
      }

      if (options.labels !== false) {
        for (const [sourceLabelId, targetLabelId] of Object.entries(labelMapping)) {
          await SyncMapping.create({
            id: (await sails.helpers.utils.generateIds(1))[0],
            boardLinkId: boardLink.id,
            entityType: 'label',
            sourceEntityId: sourceLabelId,
            targetEntityId: targetLabelId,
          });
        }
      }

      if (options.cards !== false && cardMapping) {
        for (const [sourceCardId, targetCardId] of Object.entries(cardMapping)) {
          await SyncMapping.create({
            id: (await sails.helpers.utils.generateIds(1))[0],
            boardLinkId: boardLink.id,
            entityType: 'card',
            sourceEntityId: sourceCardId,
            targetEntityId: targetCardId,
          });
        }
      }

      if (options.members !== false) {
        const sourceMemberships = await BoardMembership.find({ boardId: sourceBoard.id });
        const targetMemberships = await BoardMembership.find({ boardId: newBoard.id });

        const membershipMap = {};
        sourceMemberships.forEach((sm) => {
          const tm = targetMemberships.find((m) => m.userId === sm.userId);
          if (tm) {
            membershipMap[sm.id] = tm.id;
          }
        });

        for (const [sourceMembershipId, targetMembershipId] of Object.entries(membershipMap)) {
          await SyncMapping.create({
            id: (await sails.helpers.utils.generateIds(1))[0],
            boardLinkId: boardLink.id,
            entityType: 'board_membership',
            sourceEntityId: sourceMembershipId,
            targetEntityId: targetMembershipId,
          });
        }
      }
      /* eslint-enable no-await-in-loop, no-restricted-syntax */
    }

    const boardMemberships = await BoardMembership.find({ boardId: newBoard.id });

    sails.sockets.broadcast(`user:${currentUser.id}`, 'boardCreate', {
      item: newBoard,
      included: {
        boardMemberships,
      },
    });

    return {
      item: newBoard,
      included: {
        boardMemberships,
      },
    };
  },
};
