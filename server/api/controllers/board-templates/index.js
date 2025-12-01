const create = require('./create');
const showAll = require('./show-all');
const show = require('./show');
const update = require('./update');
const deleteTemplate = require('./delete');
const createList = require('./create-list');
const updateList = require('./update-list');
const deleteList = require('./delete-list');
const createCardType = require('./create-card-type');
const deleteCardType = require('./delete-card-type');

module.exports = {
  create,
  showAll,
  show,
  update,
  delete: deleteTemplate,
  createList,
  updateList,
  deleteList,
  createCardType,
  deleteCardType,
};
