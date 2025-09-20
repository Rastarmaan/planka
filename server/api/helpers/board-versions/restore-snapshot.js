/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    boardVersionId: {
      type: 'string',
      required: true,
    },
    requestId: {
      type: 'string',
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { boardVersionId } = inputs;

    const boardVersion = await BoardVersion.findOne({ id: boardVersionId });
    if (!boardVersion) {
      throw new Error('Board version not found');
    }

    let snapshotData;
    try {
      snapshotData = JSON.parse(boardVersion.snapshotData);
    } catch (error) {
      throw new Error('Invalid snapshot data');
    }

    const { boardId } = boardVersion;

    const currentCards = await Card.find({ boardId });
    const currentCardIds = currentCards.map((card) => card.id);

    if (currentCardIds.length > 0) {
      // Get task lists for these cards
      const currentTaskLists = await TaskList.find({ cardId: { in: currentCardIds } });
      const currentTaskListIds = currentTaskLists.map((taskList) => taskList.id);

      // Delete tasks using taskListId
      if (currentTaskListIds.length > 0) {
        await Task.destroy({ taskListId: { in: currentTaskListIds } });
      }

      await CardLabel.destroy({ cardId: { in: currentCardIds } });
      await CardMembership.destroy({ cardId: { in: currentCardIds } });
      await Comment.destroy({ cardId: { in: currentCardIds } });
      await Attachment.destroy({ cardId: { in: currentCardIds } });
    }
    await Card.destroy({ boardId });
    await Label.destroy({ boardId });
    await List.destroy({ boardId });

    await Board.updateOne({ id: boardId }).set({
      name: snapshotData.board.name,
      position: snapshotData.board.position,
      defaultView: snapshotData.board.defaultView,
      isGithubConnected: snapshotData.board.isGithubConnected,
      githubRepo: snapshotData.board.githubRepo,
    });

    const listIdMapping = {};
    await Promise.all(
      snapshotData.lists.map(async (listData) => {
        const newList = await List.create({
          ...listData,
          boardId,
        }).fetch();
        listIdMapping[listData.id] = newList.id;
      }),
    );

    const labelIdMapping = {};
    await Promise.all(
      snapshotData.labels.map(async (labelData) => {
        const newLabel = await Label.create({
          ...labelData,
          boardId,
        }).fetch();
        labelIdMapping[labelData.id] = newLabel.id;
      }),
    );

    const cardIdMapping = {};
    const cardsToCreate = [...snapshotData.cards];
    const createdCards = [];

    await Promise.all(
      cardsToCreate.map(async (cardData) => {
        const newCard = await Card.create({
          ...cardData,
          boardId,
          listId: listIdMapping[cardData.listId],
          parentCardId: null,
        }).fetch();
        cardIdMapping[cardData.id] = newCard.id;
        createdCards.push({ original: cardData, new: newCard });
      }),
    );

    await Promise.all(
      createdCards
        .filter((item) => item.original.parentCardId)
        .map(async (item) => {
          await Card.updateOne({ id: item.new.id }).set({
            parentCardId: cardIdMapping[item.original.parentCardId],
          });
        }),
    );

    if (snapshotData.attachments.length > 0) {
      await Promise.all(
        snapshotData.attachments.map(async (attachmentData) => {
          await Attachment.create({
            ...attachmentData,
            cardId: cardIdMapping[attachmentData.cardId],
          });
        }),
      );
    }

    if (snapshotData.comments.length > 0) {
      await Promise.all(
        snapshotData.comments.map(async (commentData) => {
          await Comment.create({
            ...commentData,
            cardId: cardIdMapping[commentData.cardId],
          });
        }),
      );
    }

    if (snapshotData.cardMemberships.length > 0) {
      await Promise.all(
        snapshotData.cardMemberships.map(async (membershipData) => {
          await CardMembership.create({
            ...membershipData,
            cardId: cardIdMapping[membershipData.cardId],
          });
        }),
      );
    }

    if (snapshotData.cardLabels.length > 0) {
      await Promise.all(
        snapshotData.cardLabels.map(async (cardLabelData) => {
          await CardLabel.create({
            ...cardLabelData,
            cardId: cardIdMapping[cardLabelData.cardId],
            labelId: labelIdMapping[cardLabelData.labelId],
          });
        }),
      );
    }

    // Restore task lists
    const taskListIdMapping = {};
    if (snapshotData.taskLists && snapshotData.taskLists.length > 0) {
      await Promise.all(
        snapshotData.taskLists.map(async (taskListData) => {
          const newTaskList = await TaskList.create({
            ...taskListData,
            cardId: cardIdMapping[taskListData.cardId],
          }).fetch();
          taskListIdMapping[taskListData.id] = newTaskList.id;
        }),
      );
    }

    if (snapshotData.tasks && snapshotData.tasks.length > 0) {
      await Promise.all(
        snapshotData.tasks.map(async (taskData) => {
          await Task.create({
            ...taskData,
            taskListId: taskListIdMapping[taskData.taskListId],
          });
        }),
      );
    }

    if (inputs.request) {
      sails.sockets.broadcast(
        `board:${boardId}`,
        'boardVersionRestore',
        {
          item: { boardVersionId, boardId },
        },
        inputs.request,
      );
    }

    return { success: true, boardId };
  },
};
