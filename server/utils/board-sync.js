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
          weight: sourceCard.weight,
          storyPoints: sourceCard.storyPoints,
        });

        if (sourceCard.coverAttachmentId) {
          const coverMapping = await this.getSyncMapping(
            boardLinkId,
            'attachment',
            sourceCard.coverAttachmentId,
          );
          if (coverMapping && updatedCard.coverAttachmentId !== coverMapping.targetEntityId) {
            await Card.updateOne({ id: targetCard.id }).set({
              coverAttachmentId: coverMapping.targetEntityId,
            });
          }
        } else if (updatedCard.coverAttachmentId) {
          await Card.updateOne({ id: targetCard.id }).set({
            coverAttachmentId: null,
          });
        }

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
          weight: sourceCard.weight,
          storyPoints: sourceCard.storyPoints,
        });

        if (sourceCard.coverAttachmentId) {
          const coverMapping = await this.getSyncMapping(
            boardLinkId,
            'attachment',
            sourceCard.coverAttachmentId,
          );
          if (coverMapping && updatedCard.coverAttachmentId !== coverMapping.targetEntityId) {
            await Card.updateOne({ id: existingCard.id }).set({
              coverAttachmentId: coverMapping.targetEntityId,
            });
          }
        } else if (updatedCard.coverAttachmentId) {
          await Card.updateOne({ id: existingCard.id }).set({
            coverAttachmentId: null,
          });
        }

        sails.sockets.broadcast(`board:${targetBoardId}`, 'cardUpdate', {
          item: updatedCard,
        });
        return;
      }

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
        weight: sourceCard.weight,
        storyPoints: sourceCard.storyPoints,
      }).fetch();

      await this.createSyncMapping(boardLinkId, 'card', sourceCard.id, newCard.id);

      try {
        await this.syncCardLabels(sourceCard.id, newCard.id, boardLinkId);
      } catch (labelSyncError) {
        sails.log.error('Error syncing labels for new card:', labelSyncError);
      }

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
        } else {
          await this.syncListToBoard(list, targetBoardId, link.id, req);
        }
      } catch (error) {
        sails.log.error('Error syncing list:', error);
      }
    }
    /* eslint-enable no-await-in-loop, no-restricted-syntax */
  },

  /**
   * Delete list from linked boards
   * @param {string} listId - List ID to delete
   * @param {string} boardId - Board ID
   * @param {Object} req - Request object
   */
  // eslint-disable-next-line no-unused-vars
  async deleteListFromLinkedBoards(listId, boardId, req) {
    const linkedBoards = await this.getLinkedBoards(boardId);

    /* eslint-disable no-await-in-loop, no-restricted-syntax */
    for (const link of linkedBoards) {
      try {
        const mapping = await this.getSyncMapping(link.id, 'list', listId);

        if (mapping) {
          const targetList = await List.findOne({
            id: mapping.targetEntityId,
          });
          if (targetList) {
            // Move cards to trash before deleting list
            const targetBoard = await Board.findOne({ id: link.other_board_id });
            if (targetBoard) {
              const trashList = await List.qm.getOneTrashByBoardId(targetBoard.id);

              if (trashList) {
                // Move cards to trash
                await Card.update(
                  { listId: targetList.id },
                  {
                    listId: trashList.id,
                    position: null,
                    listChangedAt: new Date().toISOString(),
                  },
                );
              }
            }

            // Delete the list
            await List.destroyOne({ id: targetList.id });

            sails.sockets.broadcast(`board:${link.other_board_id}`, 'listDelete', {
              item: { id: targetList.id },
            });
          }

          // Delete mapping
          await SyncMapping.destroyOne({ id: mapping.id });
        }
      } catch (error) {
        sails.log.error('Error deleting list from linked board:', error);
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

      /* eslint-disable no-await-in-loop, no-restricted-syntax */
      for (const link of linkedBoards) {
        try {
          // Find the corresponding card in the target board
          let cardMapping = await this.getSyncMapping(link.id, 'card', cardId);

          if (cardMapping) {
            // Current card is the source in this mapping
            await this.syncCardLabels(cardId, cardMapping.targetEntityId, link.id);
          } else {
            // Check if current card is the target in a reverse mapping
            cardMapping = await SyncMapping.findOne({
              boardLinkId: link.id,
              entityType: 'card',
              targetEntityId: cardId,
            });

            if (cardMapping) {
              // Current card is the target, so sync from source to this card
              await this.syncCardLabels(cardMapping.sourceEntityId, cardId, link.id);
            }
          }
        } catch (error) {
          sails.log.error('Error syncing single card labels for link:', error);
          // Continue with other links even if one fails
        }
      }
      /* eslint-enable no-await-in-loop, no-restricted-syntax */
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

      // Get the target card to get its boardId for socket broadcasting
      const targetCard = await Card.findOne({ id: targetCardId });
      if (!targetCard) {
        sails.log.error(`Target card ${targetCardId} not found for label sync`);
        return;
      }

      /* eslint-disable no-await-in-loop, no-restricted-syntax, no-continue */
      // Remove existing target card labels that aren't in source
      for (const targetCardLabel of targetCardLabels) {
        // Find the source label that corresponds to this target label
        // Check both directions of the mapping
        let labelMapping = await SyncMapping.findOne({
          boardLinkId,
          entityType: 'label',
          targetEntityId: targetCardLabel.labelId,
        });

        let sourceEntityIdToCheck = null;

        if (labelMapping) {
          // Normal direction: target label maps to source label
          sourceEntityIdToCheck = labelMapping.sourceEntityId;
        } else {
          // Check reverse direction
          labelMapping = await SyncMapping.findOne({
            boardLinkId,
            entityType: 'label',
            sourceEntityId: targetCardLabel.labelId,
          });

          if (labelMapping) {
            // Reverse direction: this board is actually the source, so check target
            sourceEntityIdToCheck = labelMapping.targetEntityId;
          }
        }

        // If we found a mapping in either direction, check if source has this label
        if (sourceEntityIdToCheck) {
          const hasSourceLabel = sourceCardLabels.some(
            (scl) => scl.labelId === sourceEntityIdToCheck,
          );

          if (!hasSourceLabel) {
            await CardLabel.destroyOne({ id: targetCardLabel.id });

            // Broadcast card label deletion to target board
            sails.sockets.broadcast(`board:${targetCard.boardId}`, 'cardLabelDelete', {
              item: { id: targetCardLabel.id },
            });
          }
        }
      }

      // Add source card labels to target card
      for (const sourceCardLabel of sourceCardLabels) {
        let labelMapping = await this.getSyncMapping(boardLinkId, 'label', sourceCardLabel.labelId);

        // If no mapping exists, sync the label first
        if (!labelMapping) {
          const sourceLabel = await Label.findOne({ id: sourceCardLabel.labelId });
          if (sourceLabel) {
            try {
              await this.syncLabelToBoard(sourceLabel, targetCard.boardId, boardLinkId);
              // Try to get the mapping again after syncing
              labelMapping = await this.getSyncMapping(
                boardLinkId,
                'label',
                sourceCardLabel.labelId,
              );
            } catch (labelSyncError) {
              sails.log.error('Error syncing label before card label:', labelSyncError);
            }
          }
        }

        if (!labelMapping) {
          sails.log.warn(`No label mapping found for label ${sourceCardLabel.labelId}, skipping`);
          continue;
        }

        const existingTargetCardLabel = await CardLabel.findOne({
          cardId: targetCardId,
          labelId: labelMapping.targetEntityId,
        });

        if (!existingTargetCardLabel) {
          try {
            const newCardLabel = await CardLabel.create({
              id: (await sails.helpers.utils.generateIds(1))[0],
              cardId: targetCardId,
              labelId: labelMapping.targetEntityId,
            }).fetch();

            // Broadcast card label creation to target board
            sails.sockets.broadcast(`board:${targetCard.boardId}`, 'cardLabelCreate', {
              item: newCardLabel,
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

  /**
   * Sync card memberships to linked boards
   * @param {string} cardId - Card ID whose memberships to sync
   * @param {Object} req - Request object
   */
  // eslint-disable-next-line no-unused-vars
  async syncCardMemberships(cardId, req) {
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

          // Sync the memberships for this specific card pair
          await this.syncCardMembershipsToCard(cardId, cardMapping.targetEntityId, link.id);
        } catch (error) {
          sails.log.error('Error syncing card memberships for link:', error);
          // Continue with other links even if one fails
        }
      }
      /* eslint-enable no-await-in-loop, no-restricted-syntax, no-continue */
    } catch (error) {
      sails.log.error('Error in syncCardMemberships:', error);
    }
  },

  /**
   * Sync card memberships between source and target cards
   * @param {string} sourceCardId - Source card ID
   * @param {string} targetCardId - Target card ID
   * @param {string} boardLinkId - Board link ID (unused but kept for consistency)
   */
  // eslint-disable-next-line no-unused-vars
  async syncCardMembershipsToCard(sourceCardId, targetCardId, boardLinkId) {
    try {
      // Get source card memberships
      const sourceCardMemberships = await CardMembership.find({ cardId: sourceCardId });

      // Get target card memberships
      const targetCardMemberships = await CardMembership.find({ cardId: targetCardId });

      // Get the target card to get its boardId for socket broadcasting
      const targetCard = await Card.findOne({ id: targetCardId });
      if (!targetCard) {
        sails.log.error(`Target card ${targetCardId} not found for membership sync`);
        return;
      }

      /* eslint-disable no-await-in-loop, no-restricted-syntax, no-continue */
      // Remove target card memberships that aren't in source
      for (const targetMembership of targetCardMemberships) {
        const hasSourceMembership = sourceCardMemberships.some(
          (scm) => scm.userId === targetMembership.userId,
        );
        if (!hasSourceMembership) {
          await CardMembership.destroyOne({ id: targetMembership.id });

          // Broadcast card membership deletion to target board
          sails.sockets.broadcast(`board:${targetCard.boardId}`, 'cardMembershipDelete', {
            item: { id: targetMembership.id },
          });
        }
      }

      // Add source card memberships to target card
      for (const sourceMembership of sourceCardMemberships) {
        // Check if user is a member of the target board
        const targetBoardMembership = await BoardMembership.findOne({
          boardId: targetCard.boardId,
          userId: sourceMembership.userId,
        });

        // Only sync if the user is a member of the target board
        if (!targetBoardMembership) {
          sails.log.warn(
            `User ${sourceMembership.userId} is not a member of target board ${targetCard.boardId}, skipping card membership sync`,
          );
          continue;
        }

        const existingTargetMembership = await CardMembership.findOne({
          cardId: targetCardId,
          userId: sourceMembership.userId,
        });

        if (!existingTargetMembership) {
          try {
            const newCardMembership = await CardMembership.create({
              id: (await sails.helpers.utils.generateIds(1))[0],
              cardId: targetCardId,
              userId: sourceMembership.userId,
            }).fetch();

            // Broadcast card membership creation to target board
            sails.sockets.broadcast(`board:${targetCard.boardId}`, 'cardMembershipCreate', {
              item: newCardMembership,
            });
          } catch (createError) {
            // Check if this is a duplicate key error (user already assigned to card)
            if (createError.code === 'E_UNIQUE') {
              sails.log.warn(
                `User ${sourceMembership.userId} already assigned to card ${targetCardId}, skipping`,
              );
            } else {
              sails.log.error('Error creating card membership:', createError);
            }
          }
        }
      }
      /* eslint-enable no-await-in-loop, no-restricted-syntax, no-continue */
    } catch (error) {
      sails.log.error('Error syncing card memberships:', error);
    }
  },

  /**
   * Sync card attachments to linked boards
   * @param {string} cardId - Card ID whose attachments to sync
   * @param {Object} req - Request object
   */
  // eslint-disable-next-line no-unused-vars
  async syncCardAttachments(cardId, req) {
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

          // Sync the attachments for this specific card pair
          await this.syncCardAttachmentsToCard(cardId, cardMapping.targetEntityId, link.id);
        } catch (error) {
          sails.log.error('Error syncing card attachments for link:', error);
          // Continue with other links even if one fails
        }
      }
      /* eslint-enable no-await-in-loop, no-restricted-syntax, no-continue */
    } catch (error) {
      sails.log.error('Error in syncCardAttachments:', error);
    }
  },

  /**
   * Sync card attachments between source and target cards
   * @param {string} sourceCardId - Source card ID
   * @param {string} targetCardId - Target card ID
   * @param {string} boardLinkId - Board link ID
   */
  async syncCardAttachmentsToCard(sourceCardId, targetCardId, boardLinkId) {
    try {
      // Get source card attachments
      const sourceAttachments = await Attachment.find({ cardId: sourceCardId });

      // Get target card attachments
      const targetAttachments = await Attachment.find({ cardId: targetCardId });

      // Get the target card to get its boardId for socket broadcasting
      const targetCard = await Card.findOne({ id: targetCardId });
      if (!targetCard) {
        sails.log.error(`Target card ${targetCardId} not found for attachment sync`);
        return;
      }

      /* eslint-disable no-await-in-loop, no-restricted-syntax, no-continue */
      // Remove target attachments that aren't in source
      for (const targetAttachment of targetAttachments) {
        // Check if there's a mapping for this attachment
        const attachmentMapping = await SyncMapping.findOne({
          boardLinkId,
          entityType: 'attachment',
          targetEntityId: targetAttachment.id,
        });

        if (!attachmentMapping) continue;

        const hasSourceAttachment = sourceAttachments.some(
          (sa) => sa.id === attachmentMapping.sourceEntityId,
        );
        if (!hasSourceAttachment) {
          // Delete the attachment
          await Attachment.destroyOne({ id: targetAttachment.id });

          // Broadcast attachment deletion to target board
          sails.sockets.broadcast(`board:${targetCard.boardId}`, 'attachmentDelete', {
            item: { id: targetAttachment.id },
          });

          // Remove mapping
          await SyncMapping.destroyOne({ id: attachmentMapping.id });
        }
      }

      // Add source attachments to target card
      for (const sourceAttachment of sourceAttachments) {
        // Check if this attachment is already mapped
        const existingMapping = await this.getSyncMapping(
          boardLinkId,
          'attachment',
          sourceAttachment.id,
        );

        if (existingMapping) {
          // Update existing attachment metadata (name, etc.)
          const existingTargetAttachment = await Attachment.findOne({
            id: existingMapping.targetEntityId,
          });

          if (existingTargetAttachment) {
            const updatedAttachment = await Attachment.updateOne({
              id: existingTargetAttachment.id,
            }).set({
              name: sourceAttachment.name,
            });

            // Broadcast attachment update to target board
            sails.sockets.broadcast(`board:${targetCard.boardId}`, 'attachmentUpdate', {
              item: sails.helpers.attachments.presentOne(updatedAttachment),
            });
          }
          continue;
        }

        // Create new attachment in target card
        try {
          const newAttachmentId = (await sails.helpers.utils.generateIds(1))[0];
          let newAttachment;

          if (sourceAttachment.type === Attachment.Types.LINK) {
            // For links, just copy the data
            newAttachment = await Attachment.create({
              id: newAttachmentId,
              cardId: targetCardId,
              creatorUserId: sourceAttachment.creatorUserId,
              type: sourceAttachment.type,
              name: sourceAttachment.name,
              data: sourceAttachment.data,
            }).fetch();
          } else if (sourceAttachment.type === Attachment.Types.FILE) {
            // For files, we need to copy the actual file using the file manager
            try {
              const fileManager = sails.hooks['file-manager'].getInstance();

              // Create new uploaded file record
              const newUploadedFileId = (await sails.helpers.utils.generateIds(1))[0];
              await UploadedFile.create({
                id: newUploadedFileId,
                mimeType: sourceAttachment.data.mimeType,
                size: sourceAttachment.data.size,
                type: UploadedFile.Types.ATTACHMENT,
              }).fetch();

              const sourcePathSegment = `${sails.config.custom.attachmentsPathSegment}/${sourceAttachment.data.uploadedFileId}`;
              const targetPathSegment = `${sails.config.custom.attachmentsPathSegment}/${newUploadedFileId}`;

              // Copy the main file
              const sourceFilePath = `${sourcePathSegment}/${sourceAttachment.data.filename}`;
              const targetFilePath = `${targetPathSegment}/${sourceAttachment.data.filename}`;

              // Read source file as stream and convert to buffer
              const fileStream = await fileManager.read(sourceFilePath);
              const chunks = [];

              await new Promise((resolve, reject) => {
                fileStream.on('data', (chunk) => chunks.push(chunk));
                fileStream.on('end', () => resolve());
                fileStream.on('error', (err) => reject(err));
              });

              const fileContent = Buffer.concat(chunks);

              if (fileContent && fileContent.length > 0) {
                // Save to target location
                await fileManager.save(targetFilePath, fileContent);

                // Copy thumbnails if they exist
                if (
                  sourceAttachment.data.image &&
                  sourceAttachment.data.image.thumbnailsExtension
                ) {
                  const thumbnailExt = sourceAttachment.data.image.thumbnailsExtension;
                  const sourceThumbnailsPath = `${sourcePathSegment}/thumbnails`;
                  const targetThumbnailsPath = `${targetPathSegment}/thumbnails`;

                  try {
                    const outside360Stream = await fileManager.read(
                      `${sourceThumbnailsPath}/outside-360.${thumbnailExt}`,
                    );
                    const outside360Chunks = [];
                    await new Promise((resolve, reject) => {
                      outside360Stream.on('data', (chunk) => outside360Chunks.push(chunk));
                      outside360Stream.on('end', () => resolve());
                      outside360Stream.on('error', (err) => reject(err));
                    });
                    const outside360 = Buffer.concat(outside360Chunks);

                    if (outside360 && outside360.length > 0) {
                      await fileManager.save(
                        `${targetThumbnailsPath}/outside-360.${thumbnailExt}`,
                        outside360,
                      );
                    }
                  } catch (err) {
                    sails.log.warn('Could not copy outside-360 thumbnail:', err.message);
                  }

                  try {
                    const outside720Stream = await fileManager.read(
                      `${sourceThumbnailsPath}/outside-720.${thumbnailExt}`,
                    );
                    const outside720Chunks = [];
                    await new Promise((resolve, reject) => {
                      outside720Stream.on('data', (chunk) => outside720Chunks.push(chunk));
                      outside720Stream.on('end', () => resolve());
                      outside720Stream.on('error', (err) => reject(err));
                    });
                    const outside720 = Buffer.concat(outside720Chunks);

                    if (outside720 && outside720.length > 0) {
                      await fileManager.save(
                        `${targetThumbnailsPath}/outside-720.${thumbnailExt}`,
                        outside720,
                      );
                    }
                  } catch (err) {
                    sails.log.warn('Could not copy outside-720 thumbnail:', err.message);
                  }
                }

                // Create attachment record with new uploaded file ID
                newAttachment = await Attachment.create({
                  id: newAttachmentId,
                  cardId: targetCardId,
                  creatorUserId: sourceAttachment.creatorUserId,
                  type: sourceAttachment.type,
                  name: sourceAttachment.name,
                  data: {
                    ...sourceAttachment.data,
                    uploadedFileId: newUploadedFileId,
                  },
                }).fetch();
              } else {
                sails.log.warn(
                  `Source attachment file not found or could not be read: ${sourceFilePath}, skipping attachment sync`,
                );
                continue;
              }
            } catch (fileError) {
              sails.log.error('Error copying file attachment:', fileError);
              continue;
            }
          }

          if (newAttachment) {
            // Create mapping
            await this.createSyncMapping(
              boardLinkId,
              'attachment',
              sourceAttachment.id,
              newAttachment.id,
            );

            // Broadcast attachment creation to target board
            sails.sockets.broadcast(`board:${targetCard.boardId}`, 'attachmentCreate', {
              item: sails.helpers.attachments.presentOne(newAttachment),
            });
          }
        } catch (createError) {
          sails.log.error('Error creating attachment:', createError);
        }
      }
      /* eslint-enable no-await-in-loop, no-restricted-syntax, no-continue */

      // Sync cover attachment setting
      try {
        const sourceCard = await Card.findOne({ id: sourceCardId });
        if (sourceCard && sourceCard.coverAttachmentId) {
          // Find the mapping for the cover attachment
          const coverAttachmentMapping = await this.getSyncMapping(
            boardLinkId,
            'attachment',
            sourceCard.coverAttachmentId,
          );

          if (coverAttachmentMapping) {
            // Update target card with corresponding cover attachment
            const updatedTargetCard = await Card.updateOne({ id: targetCardId }).set({
              coverAttachmentId: coverAttachmentMapping.targetEntityId,
            });

            // Broadcast card update to target board
            sails.sockets.broadcast(`board:${targetCard.boardId}`, 'cardUpdate', {
              item: updatedTargetCard,
            });
          }
        } else if (sourceCard && !sourceCard.coverAttachmentId) {
          // If source has no cover, clear target's cover
          const currentTargetCard = await Card.findOne({ id: targetCardId });
          if (currentTargetCard && currentTargetCard.coverAttachmentId) {
            const updatedTargetCard = await Card.updateOne({ id: targetCardId }).set({
              coverAttachmentId: null,
            });

            // Broadcast card update to target board
            sails.sockets.broadcast(`board:${targetCard.boardId}`, 'cardUpdate', {
              item: updatedTargetCard,
            });
          }
        }
      } catch (coverSyncError) {
        sails.log.error('Error syncing cover attachment:', coverSyncError);
      }
    } catch (error) {
      sails.log.error('Error syncing card attachments:', error);
    }
  },
};
