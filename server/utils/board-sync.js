/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Board Sync Service
 * Handles real-time synchronization between linked boards
 */

module.exports = {
  /**
   * Get all linked boards for a given board
   * @param {string} boardId - The board ID to find links for
   * @returns {Array} Array of linked board objects
   */
  async getLinkedBoards(boardId) {
    const queryResult = await sails.sendNativeQuery(
      `
      SELECT
        bl.*,
        CASE
          WHEN bl.source_board_id = $1 THEN bl.linked_board_id
          ELSE bl.source_board_id
        END as other_board_id
      FROM board_link bl
      WHERE (bl.source_board_id = $1 OR bl.linked_board_id = $1)
        AND bl.sync_enabled = true
      `,
      [boardId],
    );

    return queryResult.rows || [];
  },

  /**
   * Get sync mapping for an entity
   * @param {string} boardLinkId - The board link ID
   * @param {string} entityType - Type of entity (card, list, etc.)
   * @param {string} sourceEntityId - Source entity ID
   * @returns {Object|null} Sync mapping object or null
   */
  async getSyncMapping(boardLinkId, entityType, sourceEntityId) {
    return SyncMapping.findOne({
      boardLinkId,
      entityType,
      sourceEntityId,
    });
  },

  /**
   * Create or update sync mapping
   * @param {string} boardLinkId - The board link ID
   * @param {string} entityType - Type of entity
   * @param {string} sourceEntityId - Source entity ID
   * @param {string} targetEntityId - Target entity ID
   */
  async createSyncMapping(boardLinkId, entityType, sourceEntityId, targetEntityId) {
    const existing = await this.getSyncMapping(boardLinkId, entityType, sourceEntityId);

    if (existing) {
      return SyncMapping.updateOne({ id: existing.id }).set({
        targetEntityId,
        updatedAt: new Date(),
      });
    }

    return SyncMapping.create({
      id: (await sails.helpers.utils.generateIds(1))[0],
      boardLinkId,
      entityType,
      sourceEntityId,
      targetEntityId,
    }).fetch();
  },

  /**
   * Sync a card to all linked boards
   * @param {Object} card - The card object to sync
   * @param {Object} req - Request object for socket emission
   */
  async syncCard(card, req) {
    const linkedBoards = await this.getLinkedBoards(card.boardId);

    /* eslint-disable no-await-in-loop, no-restricted-syntax, no-continue */
    for (const link of linkedBoards) {
      try {
        const targetBoardId = link.other_board_id;
        const boardLink = await BoardLink.findOne({
          id: link.id,
        });

        // Check sync direction
        if (boardLink.syncDirection === 'one-way' && boardLink.linkedBoardId !== targetBoardId) {
          continue; // Skip if one-way and this is not the target
        }

        await this.syncCardToBoard(card, targetBoardId, link.id, req);
      } catch (error) {
        sails.log.error('Error syncing card:', error);
      }
    }
    /* eslint-enable no-await-in-loop, no-restricted-syntax, no-continue */
  },

  /**
   * Sync a card to a specific board
   * @param {Object} sourceCard - Source card
   * @param {string} targetBoardId - Target board ID
   * @param {string} boardLinkId - Board link ID
   * @param {Object} req - Request object
   */
  async syncCardToBoard(sourceCard, targetBoardId, boardLinkId, req) {
    // Find existing mapping
    const mapping = await this.getSyncMapping(boardLinkId, 'card', sourceCard.id);

    if (mapping) {
      // Update existing card
      const targetCard = await Card.findOne({ id: mapping.targetEntityId });
      if (targetCard) {
        // Find the corresponding list for the new position
        let targetListId = targetCard.listId; // Default to current list

        const sourceList = await List.findOne({ id: sourceCard.listId });
        if (sourceList) {
          const correspondingList = await this.findCorrespondingList(
            sourceCard.listId,
            targetBoardId,
            boardLinkId,
          );
          if (correspondingList) {
            targetListId = correspondingList.id;
          }
        }

        const updatedCard = await Card.updateOne({ id: targetCard.id }).set({
          name: sourceCard.name,
          description: sourceCard.description,
          dueDate: sourceCard.dueDate,
          startDate: sourceCard.startDate,
          stopwatch: sourceCard.stopwatch,
          isDueCompleted: sourceCard.isDueCompleted,
          isClosed: sourceCard.isClosed,
          position: sourceCard.position,
          listId: targetListId,
        });

        // Note: Card labels are synced separately when labels are applied/removed from cards
        // We don't sync labels here to avoid duplicate label assignments

        // Emit socket update
        sails.sockets.broadcast(`board:${targetBoardId}`, 'cardUpdate', {
          item: updatedCard,
        });
      }
    } else {
      // Check if a card with the same name already exists in the target board
      const existingCard = await Card.findOne({
        boardId: targetBoardId,
        name: sourceCard.name,
      });

      if (existingCard) {
        // Create mapping and update the existing card
        await this.createSyncMapping(boardLinkId, 'card', sourceCard.id, existingCard.id);

        // Find the corresponding list for the new position
        let targetListId = existingCard.listId; // Default to current list

        const sourceList = await List.findOne({ id: sourceCard.listId });
        if (sourceList) {
          const correspondingList = await this.findCorrespondingList(
            sourceCard.listId,
            targetBoardId,
            boardLinkId,
          );
          if (correspondingList) {
            targetListId = correspondingList.id;
          }
        }

        const updatedCard = await Card.updateOne({ id: existingCard.id }).set({
          name: sourceCard.name,
          description: sourceCard.description,
          dueDate: sourceCard.dueDate,
          startDate: sourceCard.startDate,
          stopwatch: sourceCard.stopwatch,
          isDueCompleted: sourceCard.isDueCompleted,
          isClosed: sourceCard.isClosed,
          position: sourceCard.position,
          listId: targetListId,
        });

        // Note: Card labels are synced separately when labels are applied/removed from cards
        // We don't sync labels here to avoid duplicate label assignments

        // Emit socket update
        sails.sockets.broadcast(`board:${targetBoardId}`, 'cardUpdate', {
          item: updatedCard,
        });
        return;
      }

      // Create new card in target board
      const sourceList = await List.findOne({ id: sourceCard.listId });

      // Find or create corresponding list
      let targetList = await this.findCorrespondingList(
        sourceCard.listId,
        targetBoardId,
        boardLinkId,
      );

      if (!targetList) {
        targetList = await this.syncListToBoard(sourceList, targetBoardId, boardLinkId, req);
      }

      const newCard = await Card.create({
        id: (await sails.helpers.utils.generateIds(1))[0],
        boardId: targetBoardId,
        listId: targetList.id,
        creatorUserId: sourceCard.creatorUserId,
        position: sourceCard.position,
        name: sourceCard.name,
        description: sourceCard.description,
        dueDate: sourceCard.dueDate,
        startDate: sourceCard.startDate,
        stopwatch: sourceCard.stopwatch,
        isDueCompleted: sourceCard.isDueCompleted,
        isClosed: sourceCard.isClosed,
        type: sourceCard.type,
      }).fetch();

      // Create mapping
      await this.createSyncMapping(boardLinkId, 'card', sourceCard.id, newCard.id);

      // Sync card labels for new cards only
      try {
        await this.syncCardLabels(sourceCard.id, newCard.id, boardLinkId);
      } catch (labelSyncError) {
        sails.log.error('Error syncing labels for new card:', labelSyncError);
        // Continue even if label sync fails
      }

      // Emit socket create
      sails.sockets.broadcast(`board:${targetBoardId}`, 'cardCreate', {
        item: newCard,
      });
    }
  },

  /**
   * Find corresponding list in target board
   * @param {string} sourceListId - Source list ID
   * @param {string} targetBoardId - Target board ID
   * @param {string} boardLinkId - Board link ID
   * @returns {Object|null} Target list or null
   */
  async findCorrespondingList(sourceListId, targetBoardId, boardLinkId) {
    // First, try to find an existing mapping
    const mapping = await this.getSyncMapping(boardLinkId, 'list', sourceListId);

    if (mapping) {
      return List.findOne({ id: mapping.targetEntityId });
    }

    // If no mapping exists, try to find a list with the same name
    const sourceList = await List.findOne({ id: sourceListId });
    if (sourceList) {
      const targetList = await List.findOne({
        boardId: targetBoardId,
        name: sourceList.name,
      });

      if (targetList) {
        // Create a mapping for future use
        await this.createSyncMapping(boardLinkId, 'list', sourceListId, targetList.id);
        return targetList;
      }
    }

    return null;
  },

  /**
   * Sync a list to a board
   * @param {Object} sourceList - Source list
   * @param {string} targetBoardId - Target board ID
   * @param {string} boardLinkId - Board link ID
   * @param {Object} req - Request object
   * @returns {Object} Created list
   */
  // eslint-disable-next-line no-unused-vars
  async syncListToBoard(sourceList, targetBoardId, boardLinkId, req) {
    const newList = await List.create({
      id: (await sails.helpers.utils.generateIds(1))[0],
      boardId: targetBoardId,
      position: sourceList.position,
      name: sourceList.name,
      type: sourceList.type,
    }).fetch();

    // Create mapping
    await this.createSyncMapping(boardLinkId, 'list', sourceList.id, newList.id);

    // Emit socket create
    sails.sockets.broadcast(`board:${targetBoardId}`, 'listCreate', {
      item: newList,
    });

    return newList;
  },

  /**
   * Sync list update to linked boards
   * @param {Object} list - Updated list
   * @param {Object} req - Request object
   */
  // eslint-disable-next-line no-unused-vars
  async syncList(list, req) {
    const linkedBoards = await this.getLinkedBoards(list.boardId);

    /* eslint-disable no-await-in-loop, no-restricted-syntax */
    for (const link of linkedBoards) {
      try {
        const targetBoardId = link.other_board_id;
        const mapping = await this.getSyncMapping(link.id, 'list', list.id);

        if (mapping) {
          const targetList = await List.findOne({ id: mapping.targetEntityId });
          if (targetList) {
            const updatedList = await List.updateOne({ id: targetList.id }).set({
              name: list.name,
              position: list.position,
              type: list.type,
            });

            sails.sockets.broadcast(`board:${targetBoardId}`, 'listUpdate', {
              item: updatedList,
            });
          }
        }
      } catch (error) {
        sails.log.error('Error syncing list:', error);
      }
    }
    /* eslint-enable no-await-in-loop, no-restricted-syntax */
  },

  /**
   * Sync board membership (including permissions) to linked boards
   * @param {Object} membership - Board membership object
   * @param {Object} req - Request object
   */
  // eslint-disable-next-line no-unused-vars
  async syncBoardMembership(membership, req) {
    const linkedBoards = await this.getLinkedBoards(membership.boardId);

    /* eslint-disable no-await-in-loop, no-restricted-syntax, no-continue */
    for (const link of linkedBoards) {
      try {
        const targetBoardId = link.other_board_id;
        const targetBoard = await Board.findOne({ id: targetBoardId });
        if (!targetBoard) continue;

        const mapping = await this.getSyncMapping(link.id, 'board_membership', membership.id);

        if (mapping) {
          // Update existing membership
          const targetMembership = await BoardMembership.findOne({
            id: mapping.targetEntityId,
          });

          if (targetMembership) {
            const updated = await BoardMembership.updateOne({
              id: targetMembership.id,
            }).set({
              role: membership.role,
              canComment: membership.canComment,
            });

            sails.sockets.broadcast(`board:${targetBoardId}`, 'boardMembershipUpdate', {
              item: updated,
            });
          }
        } else {
          // Create new membership
          const existing = await BoardMembership.findOne({
            boardId: targetBoardId,
            userId: membership.userId,
          });

          if (!existing) {
            const membershipId = (await sails.helpers.utils.generateIds(1))[0];
            const newMembership = await BoardMembership.create({
              id: membershipId,
              boardId: targetBoardId,
              projectId: targetBoard.projectId,
              userId: membership.userId,
              role: membership.role,
              canComment: membership.canComment,
            }).fetch();

            await this.createSyncMapping(
              link.id,
              'board_membership',
              membership.id,
              newMembership.id,
            );

            sails.sockets.broadcast(`board:${targetBoardId}`, 'boardMembershipCreate', {
              item: newMembership,
            });
          }
        }
      } catch (error) {
        sails.log.error('Error syncing board membership:', error);
      }
    }
    /* eslint-enable no-await-in-loop, no-restricted-syntax, no-continue */
  },

  /**
   * Delete card from linked boards
   * @param {string} cardId - Card ID to delete
   * @param {string} boardId - Board ID
   * @param {Object} req - Request object
   */
  // eslint-disable-next-line no-unused-vars
  async deleteCardFromLinkedBoards(cardId, boardId, req) {
    const linkedBoards = await this.getLinkedBoards(boardId);

    /* eslint-disable no-await-in-loop, no-restricted-syntax */
    for (const link of linkedBoards) {
      try {
        const mapping = await this.getSyncMapping(link.id, 'card', cardId);

        if (mapping) {
          const targetCard = await Card.findOne({ id: mapping.targetEntityId });
          if (targetCard) {
            await Card.destroyOne({ id: targetCard.id });

            sails.sockets.broadcast(`board:${link.other_board_id}`, 'cardDelete', {
              item: { id: targetCard.id },
            });
          }

          // Delete mapping
          await SyncMapping.destroyOne({ id: mapping.id });
        }
      } catch (error) {
        sails.log.error('Error deleting card from linked board:', error);
      }
    }
    /* eslint-enable no-await-in-loop, no-restricted-syntax */
  },

  /**
   * Sync label to linked boards
   * @param {Object} label - Label object
   * @param {Object} req - Request object
   */
  async syncLabel(label, req) {
    const linkedBoards = await this.getLinkedBoards(label.boardId);

    /* eslint-disable no-await-in-loop, no-restricted-syntax */
    for (const link of linkedBoards) {
      try {
        const targetBoardId = link.other_board_id;
        await this.syncLabelToBoard(label, targetBoardId, link.id, req);
      } catch (error) {
        sails.log.error('Error syncing label:', error);
      }
    }
    /* eslint-enable no-await-in-loop, no-restricted-syntax */
  },

  /**
   * Sync a label to a specific board
   * @param {Object} sourceLabel - Source label
   * @param {string} targetBoardId - Target board ID
   * @param {string} boardLinkId - Board link ID
   * @param {Object} req - Request object
   */
  // eslint-disable-next-line no-unused-vars
  async syncLabelToBoard(sourceLabel, targetBoardId, boardLinkId, req) {
    // Find existing mapping
    const mapping = await this.getSyncMapping(boardLinkId, 'label', sourceLabel.id);

    if (mapping) {
      // Update existing label
      const targetLabel = await Label.findOne({ id: mapping.targetEntityId });
      if (targetLabel) {
        const updatedLabel = await Label.updateOne({ id: targetLabel.id }).set({
          name: sourceLabel.name,
          color: sourceLabel.color,
          position: sourceLabel.position,
        });

        sails.sockets.broadcast(`board:${targetBoardId}`, 'labelUpdate', {
          item: updatedLabel,
        });
      }
    } else {
      // Check if a label with the same name and color already exists
      const existingLabel = await Label.findOne({
        boardId: targetBoardId,
        name: sourceLabel.name,
        color: sourceLabel.color,
      });

      if (existingLabel) {
        // Create mapping and update the existing label
        await this.createSyncMapping(boardLinkId, 'label', sourceLabel.id, existingLabel.id);

        const updatedLabel = await Label.updateOne({
          id: existingLabel.id,
        }).set({
          name: sourceLabel.name,
          color: sourceLabel.color,
          position: sourceLabel.position,
        });

        sails.sockets.broadcast(`board:${targetBoardId}`, 'labelUpdate', {
          item: updatedLabel,
        });
        return;
      }

      // Create new label
      const newLabel = await Label.create({
        id: (await sails.helpers.utils.generateIds(1))[0],
        boardId: targetBoardId,
        name: sourceLabel.name,
        color: sourceLabel.color,
        position: sourceLabel.position,
      }).fetch();

      // Create mapping
      await this.createSyncMapping(boardLinkId, 'label', sourceLabel.id, newLabel.id);

      sails.sockets.broadcast(`board:${targetBoardId}`, 'labelCreate', {
        item: newLabel,
      });
    }
  },

  /**
   * Sync a single card's labels to linked boards
   * @param {string} cardId - Card ID whose labels to sync
   * @param {Object} req - Request object
   */
  // eslint-disable-next-line no-unused-vars
  async syncSingleCardLabels(cardId, req) {
    try {
      const card = await Card.findOne({ id: cardId });
      if (!card) return;

      const linkedBoards = await this.getLinkedBoards(card.boardId);

      /* eslint-disable no-await-in-loop, no-restricted-syntax, no-continue */
      for (const link of linkedBoards) {
        try {
          // Find the corresponding card in the target board
          const cardMapping = await this.getSyncMapping(link.id, 'card', cardId);
          if (!cardMapping) continue;

          // Sync the labels for this specific card pair
          await this.syncCardLabels(cardId, cardMapping.targetEntityId, link.id);
        } catch (error) {
          sails.log.error('Error syncing single card labels for link:', error);
          // Continue with other links even if one fails
        }
      }
      /* eslint-enable no-await-in-loop, no-restricted-syntax, no-continue */
    } catch (error) {
      sails.log.error('Error in syncSingleCardLabels:', error);
    }
  },

  /**
   * Sync card labels between source and target cards
   * @param {string} sourceCardId - Source card ID
   * @param {string} targetCardId - Target card ID
   * @param {string} boardLinkId - Board link ID
   */
  async syncCardLabels(sourceCardId, targetCardId, boardLinkId) {
    try {
      // Get source card labels
      const sourceCardLabels = await CardLabel.find({ cardId: sourceCardId });

      // Get target card labels
      const targetCardLabels = await CardLabel.find({ cardId: targetCardId });

      /* eslint-disable no-await-in-loop, no-restricted-syntax, no-continue */
      // Remove existing target card labels that aren't in source
      for (const targetCardLabel of targetCardLabels) {
        // Find the source label that corresponds to this target label
        const labelMapping = await SyncMapping.findOne({
          boardLinkId,
          entityType: 'label',
          targetEntityId: targetCardLabel.labelId,
        });

        if (!labelMapping) continue;

        const hasSourceLabel = sourceCardLabels.some(
          (scl) => scl.labelId === labelMapping.sourceEntityId,
        );
        if (!hasSourceLabel) {
          await CardLabel.destroyOne({ id: targetCardLabel.id });
        }
      }

      // Add source card labels to target card
      for (const sourceCardLabel of sourceCardLabels) {
        const labelMapping = await this.getSyncMapping(
          boardLinkId,
          'label',
          sourceCardLabel.labelId,
        );
        if (!labelMapping) continue;

        const existingTargetCardLabel = await CardLabel.findOne({
          cardId: targetCardId,
          labelId: labelMapping.targetEntityId,
        });

        if (!existingTargetCardLabel) {
          try {
            await CardLabel.create({
              id: (await sails.helpers.utils.generateIds(1))[0],
              cardId: targetCardId,
              labelId: labelMapping.targetEntityId,
            });
          } catch (createError) {
            // Check if this is a duplicate key error (label already exists on card)
            if (
              createError.code === 'E_UNIQUE' ||
              (createError.message && createError.message.includes('already existing label'))
            ) {
              sails.log.warn(
                `Label ${labelMapping.targetEntityId} already exists on card ${targetCardId}, skipping`,
              );
            } else {
              sails.log.error('Error creating card label:', createError);
            }
          }
        }
      }
      /* eslint-enable no-await-in-loop, no-restricted-syntax, no-continue */
    } catch (error) {
      sails.log.error('Error syncing card labels:', error);
    }
  },

  /**
   * Delete label from linked boards
   * @param {string} labelId - Label ID to delete
   * @param {string} boardId - Board ID
   * @param {Object} req - Request object
   */
  // eslint-disable-next-line no-unused-vars
  async deleteLabelFromLinkedBoards(labelId, boardId, req) {
    const linkedBoards = await this.getLinkedBoards(boardId);

    /* eslint-disable no-await-in-loop, no-restricted-syntax */
    for (const link of linkedBoards) {
      try {
        const mapping = await this.getSyncMapping(link.id, 'label', labelId);

        if (mapping) {
          const targetLabel = await Label.findOne({
            id: mapping.targetEntityId,
          });
          if (targetLabel) {
            await Label.destroyOne({ id: targetLabel.id });

            sails.sockets.broadcast(`board:${link.other_board_id}`, 'labelDelete', {
              item: { id: targetLabel.id },
            });
          }

          // Delete mapping
          await SyncMapping.destroyOne({ id: mapping.id });
        }
      } catch (error) {
        sails.log.error('Error deleting label from linked board:', error);
      }
    }
    /* eslint-enable no-await-in-loop, no-restricted-syntax */
  },
};
