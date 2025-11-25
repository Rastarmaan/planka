/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { POSITION_GAP } = require('../../../constants');

module.exports = {
  inputs: {
    board: {
      type: 'ref',
      required: true,
    },
    lists: {
      type: 'ref',
      required: true,
    },
    trelloBoard: {
      type: 'json',
      required: true,
    },
    trelloApiKey: {
      type: 'string',
      required: false,
    },
    trelloApiToken: {
      type: 'string',
      required: false,
    },
  },

  async fn(inputs) {
    const convertLabelColor = (trelloLabelColor) =>
      Label.COLORS.find((color) => color.includes(trelloLabelColor)) || 'desert-sand';

    const labelIdByTrelloLabelId = {};
    await Promise.all(
      inputs.trelloBoard.labels.map(async (trelloLabel, index) => {
        const { id } = await Label.qm.createOne({
          boardId: inputs.board.id,
          position: POSITION_GAP * (index + 1),
          name: trelloLabel.name || null,
          color: convertLabelColor(trelloLabel.color),
        });

        labelIdByTrelloLabelId[trelloLabel.id] = id;
      }),
    );

    const openedTrelloLists = inputs.trelloBoard.lists.filter((list) => !list.closed);

    const listIdByTrelloListId = {};
    await Promise.all(
      openedTrelloLists.map(async (trelloList) => {
        const { id } = await List.qm.createOne({
          boardId: inputs.board.id,
          type: List.Types.ACTIVE,
          position: trelloList.pos,
          name: trelloList.name,
        });

        listIdByTrelloListId[trelloList.id] = id;
      }),
    );

    const { id: archiveListId } = inputs.lists.find((list) => list.type === List.Types.ARCHIVE);

    const cardIdByTrelloCardId = {};
    await Promise.all(
      inputs.trelloBoard.cards.map(async (trelloCard) => {
        const values = {
          boardId: inputs.board.id,
          type: Card.Types.PROJECT,
          position: trelloCard.pos,
          name: trelloCard.name,
          description: trelloCard.desc || null,
          dueDate: trelloCard.due,
          isDueCompleted: trelloCard.due && trelloCard.dueComplete,
          listChangedAt: new Date().toISOString(),
        };

        const listId = listIdByTrelloListId[trelloCard.idList];

        if (trelloCard.closed) {
          Object.assign(values, {
            listId: archiveListId,
            prevListId: listId,
          });
        } else {
          values.listId = listId || archiveListId;
        }

        const { id } = await Card.qm.createOne(values);
        cardIdByTrelloCardId[trelloCard.id] = id;

        return Promise.all(
          trelloCard.idLabels.map(async (trelloLabelId) =>
            CardLabel.qm.createOne({
              cardId: id,
              labelId: labelIdByTrelloLabelId[trelloLabelId],
            }),
          ),
        );
      }),
    );

    await Promise.all(
      inputs.trelloBoard.checklists.map(async (trelloChecklist) => {
        const { id } = await TaskList.qm.createOne({
          cardId: cardIdByTrelloCardId[trelloChecklist.idCard],
          position: trelloChecklist.pos,
          name: trelloChecklist.name,
        });

        return Promise.all(
          trelloChecklist.checkItems.map(async (trelloCheckItem) =>
            Task.qm.createOne({
              taskListId: id,
              position: trelloCheckItem.pos,
              name: trelloCheckItem.name,
              isCompleted: trelloCheckItem.state === 'complete',
            }),
          ),
        );
      }),
    );

    const trelloCommentActions = inputs.trelloBoard.actions
      .filter((action) => action.type === 'commentCard')
      .reverse();

    await Promise.all(
      trelloCommentActions.map(async (trelloAction) =>
        Comment.qm.createOne({
          cardId: cardIdByTrelloCardId[trelloAction.data.card.id],
          text: `${trelloAction.data.text}\n\n---\n*Note: imported comment, originally posted by\n${trelloAction.memberCreator.fullName} (${trelloAction.memberCreator.username}) on ${trelloAction.date}*`,
        }),
      ),
    );

    const trelloCards = inputs.trelloBoard.cards || [];
    const attachmentIdMap = {};

    await Promise.all(
      trelloCards.map(async (trelloCard) => {
        const cardId = cardIdByTrelloCardId[trelloCard.id];
        if (!cardId || !trelloCard.attachments || trelloCard.attachments.length === 0) {
          return Promise.resolve();
        }

        return Promise.all(
          trelloCard.attachments.map(async (trelloAttachment) => {
            if (!trelloAttachment.url) {
              return Promise.resolve();
            }

            try {
              let attachmentData;

              if (trelloAttachment.isUpload) {
                try {
                  let downloadUrl = trelloAttachment.url;
                  if (inputs.trelloApiKey && inputs.trelloApiToken && trelloAttachment.id) {
                    downloadUrl = `https://api.trello.com/1/cards/${trelloCard.id}/attachments/${trelloAttachment.id}/download`;
                  }

                  const downloadedFile = await sails.helpers.utils.downloadFile(
                    downloadUrl,
                    trelloAttachment.name,
                    inputs.trelloApiKey,
                    inputs.trelloApiToken,
                  );

                  if (downloadedFile) {
                    attachmentData =
                      await sails.helpers.attachments.processUploadedFile(downloadedFile);

                    const attachment = await Attachment.qm.createOne({
                      cardId,
                      type: Attachment.Types.FILE,
                      name: trelloAttachment.name || 'Imported File',
                      data: attachmentData,
                    });

                    attachmentIdMap[trelloAttachment.id] = attachment.id;

                    return attachment;
                  }
                } catch (downloadError) {
                  if (downloadError.message && downloadError.message.includes('AUTH_ERROR')) {
                    return Promise.resolve();
                  }
                }
              }

              let hostname = 'unknown';
              try {
                const urlObj = new URL(trelloAttachment.url);
                hostname = urlObj.hostname;
              } catch (urlError) {
                sails.log.warn(
                  `Invalid URL for attachment "${trelloAttachment.name}": ${trelloAttachment.url}`,
                );
              }

              const attachment = await Attachment.qm.createOne({
                cardId,
                type: Attachment.Types.LINK,
                name: trelloAttachment.name || 'Imported Link',
                data: {
                  url: trelloAttachment.url,
                  hostname,
                },
              });

              attachmentIdMap[trelloAttachment.id] = attachment.id;

              return attachment;
            } catch (error) {
              sails.log.warn(
                `Error importing attachment "${trelloAttachment.name}" for card ${cardId}:`,
                error.message,
              );
              return Promise.resolve();
            }
          }),
        );
      }),
    );

    await Promise.all(
      trelloCards.map(async (trelloCard) => {
        if (trelloCard.cover && trelloCard.cover.idAttachment) {
          const cardId = cardIdByTrelloCardId[trelloCard.id];
          const coverAttachmentId = attachmentIdMap[trelloCard.cover.idAttachment];

          if (cardId && coverAttachmentId) {
            await Card.updateOne({ id: cardId }).set({
              coverAttachmentId,
            });
          }
        }

        return Promise.resolve();
      }),
    );
  },
};
