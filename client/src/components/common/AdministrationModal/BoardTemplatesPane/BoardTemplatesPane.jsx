/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Button, Icon, Loader, Message, Tab, Table } from 'semantic-ui-react';
import api from '../../../../api';
import selectors from '../../../../selectors';
import { usePopupInClosableContext } from '../../../../hooks';
import ConfirmationStep from '../../ConfirmationStep';
import TemplateWizardModal from './TemplateWizardModal';

import styles from './BoardTemplatesPane.module.scss';

const BoardTemplatesPane = React.memo(() => {
  const [t] = useTranslation();
  const accessToken = useSelector(selectors.selectAccessToken);

  const getAuthHeaders = useCallback(() => {
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  }, [accessToken]);

  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.getBoardTemplates(getAuthHeaders());
      setTemplates(response.items || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load board templates');
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleCreate = useCallback(() => {
    setEditingTemplate(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((template) => {
    setEditingTemplate(template);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingTemplate(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    await loadTemplates();
    handleCloseForm();
  }, [loadTemplates, handleCloseForm]);

  const handleDeleteConfirm = useCallback(
    async (id) => {
      try {
        await api.deleteBoardTemplate(id, getAuthHeaders());
        await loadTemplates();
      } catch (err) {
        setError(err.message || 'Failed to delete template');
      }
    },
    [getAuthHeaders, loadTemplates],
  );

  const ConfirmationPopup = usePopupInClosableContext(ConfirmationStep);

  if (isLoading) {
    return (
      <Tab.Pane attached={false} className={styles.wrapper}>
        <Loader active />
      </Tab.Pane>
    );
  }

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      {error && (
        <Message negative>
          <Message.Header>{t('common.error')}</Message.Header>
          <p>{error}</p>
        </Message>
      )}

      <div className={styles.header}>
        <Button primary icon labelPosition="left" onClick={handleCreate}>
          <Icon name="plus" />
          {t('action.createTemplate')}
        </Button>
      </div>

      {templates.length === 0 ? (
        <Message info>
          <Message.Header>{t('common.noTemplatesYet')}</Message.Header>
          <p>{t('common.createYourFirstBoardTemplate')}</p>
        </Message>
      ) : (
        <Table celled striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell width={3}>{t('common.name')}</Table.HeaderCell>
              <Table.HeaderCell width={5}>{t('common.description')}</Table.HeaderCell>
              <Table.HeaderCell width={2} textAlign="center">
                {t('common.listsLocked')}
              </Table.HeaderCell>
              <Table.HeaderCell width={3} textAlign="center">
                {t('common.actions')}
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {templates.map((template) => (
              <Table.Row key={template.id}>
                <Table.Cell>
                  <strong>{template.name}</strong>
                </Table.Cell>
                <Table.Cell>
                  {template.description || <em>{t('common.noDescription')}</em>}
                </Table.Cell>
                <Table.Cell textAlign="center">
                  {template.isListsLocked ? (
                    <Icon name="lock" color="red" size="large" />
                  ) : (
                    <Icon name="unlock" color="green" size="large" />
                  )}
                </Table.Cell>
                <Table.Cell textAlign="center">
                  <Icon
                    name="edit"
                    size="large"
                    link
                    className={styles.actionIcon}
                    onClick={() => handleEdit(template)}
                  />
                  <ConfirmationPopup
                    title="common.deleteTemplate"
                    content="common.areYouSureYouWantToDeleteThisTemplate"
                    buttonContent="action.deleteTemplate"
                    onConfirm={() => handleDeleteConfirm(template.id)}
                  >
                    <Icon
                      name="trash"
                      size="large"
                      link
                      color="red"
                      className={styles.actionIcon}
                    />
                  </ConfirmationPopup>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      {isFormOpen && (
        <TemplateWizardModal
          template={editingTemplate}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
        />
      )}
    </Tab.Pane>
  );
});

export default BoardTemplatesPane;
