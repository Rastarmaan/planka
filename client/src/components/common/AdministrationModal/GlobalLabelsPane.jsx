/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import classNames from 'classnames';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Form, Icon, List } from 'semantic-ui-react';

import LABEL_COLORS from '../../../constants/LabelColors';
import entryActions from '../../../entry-actions';
import selectors from '../../../selectors';

import globalStyles from '../../../styles.module.scss';
import styles from './GlobalLabelsPane.module.scss';

const GlobalLabelsPane = React.memo(() => {
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const globalLabels = useSelector(selectors.selectGlobalLabels);

  const [isCreating, setIsCreating] = useState(false);
  const [editingLabelId, setEditingLabelId] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: LABEL_COLORS[0] });

  useEffect(() => {
    dispatch(entryActions.getGlobalLabels());
  }, [dispatch]);

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

  const handleDeleteClick = useCallback(
    (labelId) => {
      // eslint-disable-next-line no-alert
      if (window.confirm(t('common.areYouSureYouWantToDeleteThisItem'))) {
        dispatch(entryActions.deleteGlobalLabel(labelId));
      }
    },
    [dispatch, t],
  );

  const handleNameChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
  }, []);

  const handleColorChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, color: e.target.value }));
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
              />
              <div className={styles.colorButtons}>
                {LABEL_COLORS.map((color) => (
                  <Button
                    key={color}
                    type="button"
                    value={color}
                    className={classNames(
                      styles.colorButton,
                      color === formData.color && styles.colorButtonActive,
                      globalStyles[`background${upperFirst(camelCase(color))}`],
                    )}
                    onClick={handleColorChange}
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
            <div className={styles.actions}>
              <Button size="tiny" icon onClick={() => handleEditClick(label)}>
                <Icon name="pencil" />
              </Button>
              <Button size="tiny" icon onClick={() => handleDeleteClick(label.id)}>
                <Icon name="trash" />
              </Button>
            </div>
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
      t,
    ],
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3>{t('common.globalLabels', { context: 'title' })}</h3>
        {!isCreating && (
          <Button primary onClick={handleCreateClick}>
            <Icon name="plus" />
            {t('action.createLabel')}
          </Button>
        )}
      </div>

      {isCreating && (
        <div className={styles.createForm}>
          <div className={styles.labelForm}>
            <Form.Input
              fluid
              value={formData.name}
              onChange={handleNameChange}
              placeholder={t('common.name')}
              maxLength={128}
            />
            <div className={styles.colorButtons}>
              {LABEL_COLORS.map((color) => (
                <Button
                  key={color}
                  type="button"
                  value={color}
                  className={classNames(
                    styles.colorButton,
                    color === formData.color && styles.colorButtonActive,
                    globalStyles[`background${upperFirst(camelCase(color))}`],
                  )}
                  onClick={handleColorChange}
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
    </div>
  );
});

export default GlobalLabelsPane;
