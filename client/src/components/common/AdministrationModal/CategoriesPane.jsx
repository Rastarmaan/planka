/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Form, Icon, Label, List } from 'semantic-ui-react';

import entryActions from '../../../entry-actions';
import selectors from '../../../selectors';

import styles from './CategoriesPane.module.scss';

const CategoriesPane = React.memo(() => {
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const categories = useSelector(selectors.selectAllProjectCategories);

  const [isCreating, setIsCreating] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', color: '#FF5733' });

  const handleCreateClick = useCallback(() => {
    setIsCreating(true);
    setFormData({ name: '', description: '', color: '#FF5733' });
  }, []);

  const handleCancelCreate = useCallback(() => {
    setIsCreating(false);
    setFormData({ name: '', description: '', color: '#FF5733' });
  }, []);

  const handleSubmitCreate = useCallback(() => {
    if (formData.name.trim()) {
      dispatch(entryActions.createProjectCategory(formData));
      setIsCreating(false);
      setFormData({ name: '', description: '', color: '#FF5733' });
    }
  }, [dispatch, formData]);

  const handleEditClick = useCallback((category) => {
    setEditingCategoryId(category.id);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#FF5733',
    });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingCategoryId(null);
    setFormData({ name: '', description: '', color: '#FF5733' });
  }, []);

  const handleSubmitEdit = useCallback(() => {
    if (formData.name.trim()) {
      dispatch(entryActions.updateProjectCategory(editingCategoryId, formData));
      setEditingCategoryId(null);
      setFormData({ name: '', description: '', color: '#FF5733' });
    }
  }, [dispatch, editingCategoryId, formData]);

  const handleDeleteClick = useCallback(
    (categoryId) => {
      // eslint-disable-next-line no-alert
      if (window.confirm(t('common.areYouSureYouWantToDeleteThisItem'))) {
        dispatch(entryActions.deleteProjectCategory(categoryId));
      }
    },
    [dispatch, t],
  );

  const handleNameChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
  }, []);

  const handleDescriptionChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, description: e.target.value }));
  }, []);

  const handleColorChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, color: e.target.value }));
  }, []);

  const renderCategoryItem = useCallback(
    (category) => {
      const isEditing = editingCategoryId === category.id;

      if (isEditing) {
        return (
          <List.Item key={category.id} className={styles.categoryItem}>
            <div className={styles.categoryForm}>
              <Form.Input
                fluid
                value={formData.name}
                onChange={handleNameChange}
                placeholder={t('common.name')}
                maxLength={128}
              />
              <Form.TextArea
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder={t('common.description')}
                maxLength={1024}
                rows={2}
              />
              <Form.Field>
                <label htmlFor="create-category-color">{t('common.color')}</label>
                <input
                  id="create-category-color"
                  type="color"
                  value={formData.color}
                  onChange={handleColorChange}
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
            </div>
          </List.Item>
        );
      }

      return (
        <List.Item key={category.id} className={styles.categoryItem}>
          <div className={styles.category}>
            <Label
              style={{
                backgroundColor: category.color || '#FF5733',
                color: '#fff',
              }}
            >
              {category.name}
            </Label>
            {category.description && (
              <span className={styles.description}>{category.description}</span>
            )}
            <div className={styles.actions}>
              <Button size="tiny" icon onClick={() => handleEditClick(category)}>
                <Icon name="pencil" />
              </Button>
              <Button size="tiny" icon onClick={() => handleDeleteClick(category.id)}>
                <Icon name="trash" />
              </Button>
            </div>
          </div>
        </List.Item>
      );
    },
    [
      editingCategoryId,
      formData,
      handleNameChange,
      handleDescriptionChange,
      handleColorChange,
      handleSubmitEdit,
      handleCancelEdit,
      handleEditClick,
      handleDeleteClick,
      t,
    ],
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3>{t('common.categories', { context: 'title' })}</h3>
        {!isCreating && (
          <Button primary onClick={handleCreateClick}>
            <Icon name="plus" />
            {t('action.createCategory')}
          </Button>
        )}
      </div>

      {isCreating && (
        <div className={styles.createForm}>
          <div className={styles.categoryForm}>
            <Form.Input
              fluid
              value={formData.name}
              onChange={handleNameChange}
              placeholder={t('common.name')}
              maxLength={128}
            />
            <Form.TextArea
              value={formData.description}
              onChange={handleDescriptionChange}
              placeholder={t('common.description')}
              maxLength={1024}
              rows={2}
            />
            <Form.Field>
              <label htmlFor="edit-category-color">{t('common.color')}</label>
              <input
                id="edit-category-color"
                type="color"
                value={formData.color}
                onChange={handleColorChange}
              />
            </Form.Field>
            <div className={styles.actions}>
              <Button size="small" primary onClick={handleSubmitCreate}>
                {t('action.create')}
              </Button>
              <Button size="small" onClick={handleCancelCreate}>
                {t('action.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <List divided relaxed className={styles.categoriesList}>
        {categories.map(renderCategoryItem)}
      </List>

      {categories.length === 0 && !isCreating && (
        <div className={styles.emptyState}>
          <p>{t('common.noProjectCategoriesYet')}</p>
        </div>
      )}
    </div>
  );
});

export default CategoriesPane;
