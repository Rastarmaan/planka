/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

const getBoardTemplates = (headers) => socket.get('/board-templates', undefined, headers);

const createBoardTemplate = (data, headers) => socket.post('/board-templates', data, headers);

const getBoardTemplate = (id, headers) => socket.get(`/board-templates/${id}`, undefined, headers);

const updateBoardTemplate = (id, data, headers) =>
  socket.patch(`/board-templates/${id}`, data, headers);

const deleteBoardTemplate = (id, headers) =>
  socket.delete(`/board-templates/${id}`, undefined, headers);

const createBoardTemplateList = (templateId, data, headers) =>
  socket.post(`/board-templates/${templateId}/lists`, data, headers);

const updateBoardTemplateList = (templateId, listId, data, headers) =>
  socket.patch(`/board-templates/${templateId}/lists/${listId}`, data, headers);

const deleteBoardTemplateList = (templateId, listId, headers) =>
  socket.delete(`/board-templates/${templateId}/lists/${listId}`, undefined, headers);

const createBoardTemplateCardType = (templateId, data, headers) =>
  socket.post(`/board-templates/${templateId}/card-types`, data, headers);

const deleteBoardTemplateCardType = (templateId, typeId, headers) =>
  socket.delete(`/board-templates/${templateId}/card-types/${typeId}`, undefined, headers);

export default {
  getBoardTemplates,
  createBoardTemplate,
  getBoardTemplate,
  updateBoardTemplate,
  deleteBoardTemplate,
  createBoardTemplateList,
  updateBoardTemplateList,
  deleteBoardTemplateList,
  createBoardTemplateCardType,
  deleteBoardTemplateCardType,
};
