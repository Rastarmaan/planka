/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Form, Icon, List, Modal } from 'semantic-ui-react';

import { UserRoles } from '../../../constants/Enums';
import entryActions from '../../../entry-actions';
import selectors from '../../../selectors';

import styles from './ProjectCategoriesModal.module.scss';

const ProjectCategoriesModal = React.memo(({ onClose }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const projectCategories = useSelector(selectors.selectProjectCategoriesOrderedByName);
  const currentUser = useSelector(selectors.selectCurrentUser);
  const isAdmin = currentUser && currentUser.role === UserRoles.ADMIN;

  const [isCreating, setIsCreating] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleCreateClick = useCallback(() => {
    setIsCreating(true);
    setFormData({ name: '', description: '' });
  }, []);

  const handleCancelCreate = useCallback(() => {
    setIsCreating(false);
    setFormData({ name: '', description: '' });
  }, []);

  const handleSubmitCreate = useCallback(() => {
    if (formData.name.trim()) {
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
      };
      dispatch(entryActions.createProjectCategory(data));
      setIsCreating(false);
      setFormData({ name: '', description: '' });
    }
  }, [dispatch, formData]);

  const handleEditClick = useCallback((category) => {
    setEditingCategoryId(category.id);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingCategoryId(null);
    setFormData({ name: '', description: '' });
  }, []);

  const handleSubmitEdit = useCallback(() => {
    if (formData.name.trim()) {
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
      };
      dispatch(entryActions.updateProjectCategory(editingCategoryId, data));
      setEditingCategoryId(null);
      setFormData({ name: '', description: '' });
    }
  }, [dispatch, editingCategoryId, formData]);

  const handleDeleteClick = useCallback((categoryId) => {
    setDeletingCategoryId(categoryId);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (deletingCategoryId) {
      dispatch(entryActions.deleteProjectCategory(deletingCategoryId));
      setDeletingCategoryId(null);
    }
  }, [dispatch, deletingCategoryId]);

  const handleDeleteCancel = useCallback(() => {
    setDeletingCategoryId(null);
  }, []);

  const handleNameChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
  }, []);

  const handleDescriptionChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, description: e.target.value }));
  }, []);

  const renderCategoryItem = useCallback(
    (category) => {
      const isEditing = editingCategoryId === category.id;

      if (isEditing) {
        return (
          <List.Item key={category.id} className={styles.categoryItem}>
            <Form className={styles.categoryForm}>
              <Form.Field>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder={t('common.name')}
                  maxLength={255}
                />
              </Form.Field>
              <Form.Field>
                <textarea
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  placeholder={t('common.description')}
                  maxLength={1024}
                  rows={2}
                />
              </Form.Field>
              <div className={styles.actions}>
                <Button size="small" primary onClick={handleSubmitEdit}>
                  {t('action.save')}
                </Button>
                <Button size="small" onClick={handleCancelEdit}>
                  {t('action.cancel')}
                </Button>
              </div>
            </Form>
          </List.Item>
        );
      }

      return (
        <List.Item key={category.id} className={styles.categoryItem}>
          <div className={styles.category}>
            <div className={styles.categoryInfo}>
              <span className={styles.categoryName}>{category.name}</span>
              {category.description && (
                <span className={styles.categoryDescription}>{category.description}</span>
              )}
            </div>
            {isAdmin && (
              <div className={styles.actions}>
                <Button size="tiny" icon onClick={() => handleEditClick(category)}>
                  <Icon name="pencil" />
                </Button>
                <Button size="tiny" icon onClick={() => handleDeleteClick(category.id)}>
                  <Icon name="trash" />
                </Button>
              </div>
            )}
          </div>
        </List.Item>
      );
    },
    [
      editingCategoryId,
      formData,
      handleNameChange,
      handleDescriptionChange,
      handleSubmitEdit,
      handleCancelEdit,
      handleEditClick,
      handleDeleteClick,
      isAdmin,
      t,
    ],
  );

  return (
    <Modal open onClose={onClose} size="small" closeIcon>
      <Modal.Header>
        <Icon name="folder" />
        {t('common.projectCategories', { context: 'title' })}
      </Modal.Header>
      <Modal.Content scrolling>
        {isAdmin && !isCreating && (
          <div className={styles.headerActions}>
            <Button primary onClick={handleCreateClick}>
              <Icon name="plus" />
              {t('action.createCategory')}
            </Button>
          </div>
        )}

        {isCreating && (
          <Form className={styles.createForm}>
            <Form.Field required>
              <label htmlFor="category-name">{t('common.name')}</label>
              <input
                id="category-name"
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                placeholder={t('common.name')}
                maxLength={255}
              />
            </Form.Field>
            <Form.Field>
              <label htmlFor="category-description">
                {t('common.description')}{' '}
                <span className={styles.optional}>({t('common.optional')})</span>
              </label>
              <textarea
                id="category-description"
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder={t('common.description')}
                maxLength={1024}
                rows={3}
              />
            </Form.Field>
            <div className={styles.actions}>
              <Button primary onClick={handleSubmitCreate}>
                {t('action.create')}
              </Button>
              <Button onClick={handleCancelCreate}>{t('action.cancel')}</Button>
            </div>
          </Form>
        )}

        <List divided relaxed className={styles.categoriesList}>
          {projectCategories.map(renderCategoryItem)}
        </List>

        {projectCategories.length === 0 && !isCreating && (
          <div className={styles.emptyState}>
            <p>{t('common.noProjectCategoriesYet')}</p>
          </div>
        )}
      </Modal.Content>

      {deletingCategoryId && (
        <Modal open size="tiny" onClose={handleDeleteCancel}>
          <Modal.Header>{t('common.deleteCategory', { context: 'title' })}</Modal.Header>
          <Modal.Content>
            <p>{t('common.areYouSureYouWantToDeleteThisCategory')}</p>
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={handleDeleteCancel}>{t('action.cancel')}</Button>
            <Button negative onClick={handleDeleteConfirm}>
              {t('action.deleteCategory')}
            </Button>
          </Modal.Actions>
        </Modal>
      )}
    </Modal>
  );
});

ProjectCategoriesModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default ProjectCategoriesModal;
