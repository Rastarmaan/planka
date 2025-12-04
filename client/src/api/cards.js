import omit from 'lodash/omit';

import { transformActivity } from './activities';
import { transformAttachment } from './attachments';
import { transformNotification } from './notifications';
import socket from './socket';

/* Transformers */

export const transformCard = (card) => ({
  ...card,
  ...(card.startDate && {
    startDate: new Date(card.startDate),
  }),
  ...(card.dueDate && {
    dueDate: new Date(card.dueDate),
  }),
  ...(card.stopwatch && {
    stopwatch: {
      ...card.stopwatch,
      ...(card.stopwatch.startedAt && {
        startedAt: new Date(card.stopwatch.startedAt),
      }),
    },
  }),
  ...(card.createdAt && {
    createdAt: new Date(card.createdAt),
  }),
  ...(card.listChangedAt && {
    listChangedAt: new Date(card.listChangedAt),
  }),
});

export const transformCardData = (data) => ({
  ...data,
  ...(data.startDate && {
    startDate: data.startDate.toISOString(),
  }),
  ...(data.dueDate && {
    dueDate: data.dueDate.toISOString(),
  }),
  ...(data.stopwatch && {
    stopwatch: {
      ...data.stopwatch,
      ...(data.stopwatch.startedAt && {
        startedAt: data.stopwatch.startedAt.toISOString(),
      }),
    },
  }),
});

/* Actions */

const getCards = (listId, data, headers) =>
  socket.get(`/lists/${listId}/cards`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformCard),
    included: {
      ...body.included,
      attachments: body.included.attachments.map(transformAttachment),
    },
  }));

const createCard = (listId, data, headers) =>
  socket.post(`/lists/${listId}/cards`, transformCardData(data), headers).then((body) => ({
    ...body,
    item: transformCard(body.item),
  }));

const getCard = (id, headers) =>
  socket.get(`/cards/${id}`, undefined, headers).then((body) => {
    return {
      ...body,
      item: transformCard(body.item),
      included: {
        ...body.included,
        attachments: body.included.attachments.map(transformAttachment),
        releaseCards: body.included.releaseCards || [],
        boardReleases: body.included.boardReleases || [],
      },
    };
  });

const updateCard = (id, data, headers) =>
  socket.patch(`/cards/${id}`, transformCardData(data), headers).then((body) => ({
    ...body,
    item: transformCard(body.item),
  }));

const duplicateCard = (id, data, headers) =>
  socket.post(`/cards/${id}/duplicate`, data, headers).then((body) => ({
    ...body,
    item: transformCard(body.item),
    included: {
      ...body.included,
      attachments: body.included.attachments.map(transformAttachment),
    },
  }));

const importAndSyncCard = (data, headers) =>
  socket.post('/cards/import-and-sync', data, headers).then((body) => ({
    ...body,
    item: transformCard(body.item),
    included: {
      ...body.included,
      attachments: body.included.attachments.map(transformAttachment),
    },
  }));

const readCardNotifications = (id, headers) =>
  socket.post(`/cards/${id}/read-notifications`, undefined, headers).then((body) => ({
    ...body,
    item: transformCard(body.item),
    included: {
      ...body.included,
      notifications: body.included.notifications.map(transformNotification),
    },
  }));

const deleteCard = (id, headers) =>
  socket.delete(`/cards/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformCard(body.item),
  }));

const getChildCards = (parentId, headers) =>
  socket.get(`/cards/${parentId}/children`, undefined, headers).then((body) => ({
    ...body,
    items: body.items.map(transformCard),
    included: {
      ...body.included,
      attachments: body.included.attachments.map(transformAttachment),
    },
  }));

const filterCards = (filters, headers) => {
  const queryParams = new URLSearchParams();
  Object.keys(filters).forEach((key) => {
    if (filters[key] !== undefined && filters[key] !== null) {
      queryParams.append(key, filters[key]);
    }
  });
  const queryString = queryParams.toString();
  const url = `/cards/filter${queryString ? `?${queryString}` : ''}`;

  return socket.get(url, undefined, headers).then((body) => ({
    ...body,
    items: body.items.map(transformCard),
  }));
};

/* Event handlers */

const makeHandleCardsUpdate = (next) => (body) => {
  next({
    ...body,
    items: body.items.map(transformCard),
    included: body.included && {
      ...omit(body.included, 'actions'),
      activities: body.included.actions.map(transformActivity),
    },
  });
};

const makeHandleCardCreate = (next) => (body) => {
  next({
    ...body,
    item: transformCard(body.item),
  });
};

const makeHandleCardUpdate = makeHandleCardCreate;

const makeHandleCardDelete = makeHandleCardUpdate;

export default {
  getCards,
  createCard,
  getCard,
  updateCard,
  duplicateCard,
  importAndSyncCard,
  readCardNotifications,
  deleteCard,
  getChildCards,
  filterCards,
  makeHandleCardsUpdate,
  makeHandleCardCreate,
  makeHandleCardUpdate,
  makeHandleCardDelete,
};
