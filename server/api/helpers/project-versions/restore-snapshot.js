/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    projectVersionId: {
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
    const { projectVersionId } = inputs;

    const projectVersion = await ProjectVersion.findOne({ id: projectVersionId });
    if (!projectVersion) {
      throw new Error('Project version not found');
    }

    let snapshotData;
    try {
      snapshotData =
        typeof projectVersion.snapshotData === 'string'
          ? JSON.parse(projectVersion.snapshotData)
          : projectVersion.snapshotData;
    } catch (error) {
      throw new Error('Invalid snapshot data');
    }

    const { projectId } = projectVersion;

    const currentBoards = await Board.find({ projectId });
    const currentBoardIds = currentBoards.map((board) => board.id);

    if (currentBoardIds.length > 0) {
      const currentCards = await Card.find({ boardId: { in: currentBoardIds } });
      const currentCardIds = currentCards.map((card) => card.id);

      if (currentCardIds.length > 0) {
        const currentTaskLists = await TaskList.find({ cardId: { in: currentCardIds } });
        const currentTaskListIds = currentTaskLists.map((taskList) => taskList.id);

        if (currentTaskListIds.length > 0) {
          await Task.destroy({ taskListId: { in: currentTaskListIds } });
        }

        await TaskList.destroy({ cardId: { in: currentCardIds } });

        await CardLabel.destroy({ cardId: { in: currentCardIds } });
        await CardMembership.destroy({ cardId: { in: currentCardIds } });
        await Comment.destroy({ cardId: { in: currentCardIds } });
        await Attachment.destroy({ cardId: { in: currentCardIds } });
      }

      await Card.destroy({ boardId: { in: currentBoardIds } });

      await Label.destroy({ boardId: { in: currentBoardIds } });

      await List.destroy({ boardId: { in: currentBoardIds } });

      await BoardMembership.destroy({ boardId: { in: currentBoardIds } });

      await Board.destroy({ projectId });
    }

    await ProjectManager.destroy({ projectId });

    await Project.updateOne({ id: projectId }).set({
      name: snapshotData.project.name,
      background: snapshotData.project.background,
      backgroundImage: snapshotData.project.backgroundImage,
    });

    if (snapshotData.projectManagers && snapshotData.projectManagers.length > 0) {
      await Promise.all(
        snapshotData.projectManagers.map(async (managerData) => {
          await ProjectManager.create({
            projectId,
            userId: managerData.userId,
          });
        }),
      );
    }

    const boardIdMapping = {};
    await Promise.all(
      snapshotData.boards.map(async (boardData) => {
        const newBoard = await Board.create({
          ...boardData,
          projectId,
        }).fetch();
        boardIdMapping[boardData.id] = newBoard.id;
      }),
    );

    const listIdMapping = {};
    await Promise.all(
      snapshotData.lists.map(async (listData) => {
        const newList = await List.create({
          ...listData,
          boardId: boardIdMapping[listData.boardId],
        }).fetch();
        listIdMapping[listData.id] = newList.id;
      }),
    );

    const labelIdMapping = {};
    await Promise.all(
      snapshotData.labels.map(async (labelData) => {
        const newLabel = await Label.create({
          ...labelData,
          boardId: boardIdMapping[labelData.boardId],
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
          boardId: boardIdMapping[cardData.boardId],
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

    if (snapshotData.attachments && snapshotData.attachments.length > 0) {
      await Promise.all(
        snapshotData.attachments.map(async (attachmentData) => {
          await Attachment.create({
            ...attachmentData,
            cardId: cardIdMapping[attachmentData.cardId],
          });
        }),
      );
    }

    if (snapshotData.comments && snapshotData.comments.length > 0) {
      await Promise.all(
        snapshotData.comments.map(async (commentData) => {
          await Comment.create({
            ...commentData,
            cardId: cardIdMapping[commentData.cardId],
          });
        }),
      );
    }

    if (snapshotData.cardMemberships && snapshotData.cardMemberships.length > 0) {
      await Promise.all(
        snapshotData.cardMemberships.map(async (membershipData) => {
          await CardMembership.create({
            ...membershipData,
            cardId: cardIdMapping[membershipData.cardId],
          });
        }),
      );
    }

    if (snapshotData.cardLabels && snapshotData.cardLabels.length > 0) {
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

    if (snapshotData.boardMemberships && snapshotData.boardMemberships.length > 0) {
      await Promise.all(
        snapshotData.boardMemberships.map(async (membershipData) => {
          await BoardMembership.create({
            ...membershipData,
            boardId: boardIdMapping[membershipData.boardId],
          });
        }),
      );
    }

    if (inputs.request) {
      sails.sockets.broadcast(
        `project:${projectId}`,
        'projectVersionRestore',
        {
          item: { projectVersionId, projectId },
        },
        inputs.request,
      );
    }

    return { success: true, projectId };
  },
};
