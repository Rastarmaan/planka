/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import classNames from 'classnames';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Form, Icon, List, Modal } from 'semantic-ui-react';

import { UserRoles } from '../../../constants/Enums';
import LABEL_COLORS from '../../../constants/LabelColors';
import entryActions from '../../../entry-actions';
import selectors from '../../../selectors';

import globalStyles from '../../../styles.module.scss';
import styles from './GlobalLabelsModal.module.scss';

const GlobalLabelsModal = React.memo(({ onClose }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const globalLabels = useSelector(selectors.selectGlobalLabels);
  const currentUser = useSelector(selectors.selectCurrentUser);
  const isAdmin = currentUser && currentUser.role === UserRoles.ADMIN;

  const [isCreating, setIsCreating] = useState(false);
  const [editingLabelId, setEditingLabelId] = useState(null);
  const [deletingLabelId, setDeletingLabelId] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: LABEL_COLORS[0] });

  const handleCreateClick = useCallback(() => {
    setIsCreating(true);
    setFormData({ name: '', color: LABEL_COLORS[0] });
  }, []);

  const handleCancelCreate = useCallback(() => {
    setIsCreating(false);
    setFormData({ name: '', color: LABEL_COLORS[0] });
  }, []);

  const handleSubmitCreate = useCallback(() => {
    if (formData.name.trim()) {
      dispatch(entryActions.createGlobalLabel(formData));
      setIsCreating(false);
      setFormData({ name: '', color: LABEL_COLORS[0] });
    }
  }, [dispatch, formData]);

  const handleEditClick = useCallback((label) => {
    setEditingLabelId(label.id);
    setFormData({ name: label.name, color: label.color });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingLabelId(null);
    setFormData({ name: '', color: LABEL_COLORS[0] });
  }, []);

  const handleSubmitEdit = useCallback(() => {
    if (formData.name.trim()) {
      dispatch(entryActions.updateGlobalLabel(editingLabelId, formData));
      setEditingLabelId(null);
      setFormData({ name: '', color: LABEL_COLORS[0] });
    }
  }, [dispatch, editingLabelId, formData]);

  const handleDeleteClick = useCallback((labelId) => {
    setDeletingLabelId(labelId);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (deletingLabelId) {
      dispatch(entryActions.deleteGlobalLabel(deletingLabelId));
      setDeletingLabelId(null);
    }
  }, [dispatch, deletingLabelId]);

  const handleDeleteCancel = useCallback(() => {
    setDeletingLabelId(null);
  }, []);

  const handleNameChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
  }, []);

  const handleColorChange = useCallback((color) => {
    setFormData((prev) => ({ ...prev, color }));
  }, []);

  const renderLabelItem = useCallback(
    (label) => {
      const isEditing = editingLabelId === label.id;

      if (isEditing) {
        return (
          <List.Item key={label.id} className={styles.labelItem}>
            <div className={styles.labelForm}>
              <Form.Input
                fluid
                value={formData.name}
                onChange={handleNameChange}
                placeholder={t('common.name')}
                maxLength={128}
                className={styles.nameInput}
              />
              <div className={styles.colorButtons}>
                {LABEL_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={classNames(
                      styles.colorButton,
                      color === formData.color && styles.colorButtonActive,
                      globalStyles[`background${upperFirst(camelCase(color))}`],
                    )}
                    onClick={() => handleColorChange(color)}
                    aria-label={color}
                  />
                ))}
              </div>
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
        <List.Item key={label.id} className={styles.labelItem}>
          <div className={styles.label}>
            <span
              className={classNames(
                styles.colorPreview,
                globalStyles[`background${upperFirst(camelCase(label.color))}`],
              )}
            />
            <span className={styles.labelName}>{label.name}</span>
            {isAdmin && (
              <div className={styles.actions}>
                <Button size="tiny" icon onClick={() => handleEditClick(label)}>
                  <Icon name="pencil" />
                </Button>
                <Button size="tiny" icon onClick={() => handleDeleteClick(label.id)}>
                  <Icon name="trash" />
                </Button>
              </div>
            )}
          </div>
        </List.Item>
      );
    },
    [
      editingLabelId,
      formData,
      handleNameChange,
      handleColorChange,
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
        <Icon name="tags" />
        {t('common.globalLabels', { context: 'title' })}
      </Modal.Header>
      <Modal.Content scrolling>
        {isAdmin && !isCreating && (
          <div className={styles.headerActions}>
            <Button primary onClick={handleCreateClick}>
              <Icon name="plus" />
              {t('action.createLabel')}
            </Button>
          </div>
        )}

        {isCreating && (
          <div className={styles.createForm}>
            <Form.Input
              fluid
              value={formData.name}
              onChange={handleNameChange}
              placeholder={t('common.name')}
              maxLength={128}
              className={styles.nameInput}
            />
            <div className={styles.colorButtons}>
              {LABEL_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={classNames(
                    styles.colorButton,
                    color === formData.color && styles.colorButtonActive,
                    globalStyles[`background${upperFirst(camelCase(color))}`],
                  )}
                  onClick={() => handleColorChange(color)}
                  aria-label={color}
                />
              ))}
            </div>
            <div className={styles.actions}>
              <Button size="small" primary onClick={handleSubmitCreate}>
                {t('action.create')}
              </Button>
              <Button size="small" onClick={handleCancelCreate}>
                {t('action.cancel')}
              </Button>
            </div>
          </div>
        )}

        <List divided relaxed className={styles.labelsList}>
          {globalLabels.map(renderLabelItem)}
        </List>

        {globalLabels.length === 0 && !isCreating && (
          <div className={styles.emptyState}>
            <p>{t('common.noGlobalLabelsYet')}</p>
          </div>
        )}
      </Modal.Content>

      {deletingLabelId && (
        <Modal open size="tiny" onClose={handleDeleteCancel}>
          <Modal.Header>{t('common.deleteLabel', { context: 'title' })}</Modal.Header>
          <Modal.Content>
            <p>{t('common.areYouSureYouWantToDeleteThisLabel')}</p>
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={handleDeleteCancel}>{t('action.cancel')}</Button>
            <Button negative onClick={handleDeleteConfirm}>
              {t('action.deleteLabel')}
            </Button>
          </Modal.Actions>
        </Modal>
      )}
    </Modal>
  );
});

GlobalLabelsModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default GlobalLabelsModal;
