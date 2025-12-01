/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  Button,
  Checkbox,
  Dropdown,
  Form,
  Icon,
  Input,
  List,
  Modal,
  Tab,
  TextArea,
} from 'semantic-ui-react';

import api from '../../../../api';
import selectors from '../../../../selectors';
import styles from './TemplateDetailsModal.module.scss';

const CARD_TYPE_OPTIONS = [
  { key: 'project', value: 'project', text: 'Project', color: 'blue' },
  { key: 'story', value: 'story', text: 'Story', color: 'green' },
  { key: 'epic', value: 'epic', text: 'Epic', color: 'purple' },
];

const TemplateDetailsModal = React.memo(({ template, onUpdate, onClose }) => {
  const [t] = useTranslation();
  const accessToken = useSelector(selectors.selectAccessToken);

  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description || '');
  const [isListsLocked, setIsListsLocked] = useState(template.isListsLocked);
  const [lists, setLists] = useState([]);
  const [cardTypes, setCardTypes] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadTemplateDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const headers = { Authorization: `Bearer ${accessToken}` };

      const data = await api.getBoardTemplate(template.id, headers);

      setLists(data.lists || []);
      setCardTypes(data.cardTypes || []);
    } catch (error) {
      // Failed to load template details
    } finally {
      setIsLoading(false);
    }
  }, [template.id, accessToken]);

  useEffect(() => {
    loadTemplateDetails();
  }, [loadTemplateDetails]);

  const handleSaveBasicInfo = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      await api.updateBoardTemplate(
        template.id,
        { name: name.trim(), description: description.trim() || null, isListsLocked },
        headers,
      );
      onUpdate();
    } catch (error) {
      // Failed to update template
    }
  }, [template.id, name, description, isListsLocked, accessToken, onUpdate]);

  const handleAddList = useCallback(async () => {
    if (!newListName.trim()) return;

    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      const position = lists.length > 0 ? Math.max(...lists.map((l) => l.position)) + 65536 : 65536;

      await api.createBoardTemplateList(
        template.id,
        { name: newListName.trim(), position },
        headers,
      );

      setNewListName('');
      await loadTemplateDetails();
    } catch (error) {
      // Failed to add list
    }
  }, [newListName, lists, template.id, accessToken, loadTemplateDetails]);

  const handleDeleteList = useCallback(
    async (listId) => {
      try {
        const headers = { Authorization: `Bearer ${accessToken}` };
        await api.deleteBoardTemplateList(template.id, listId, headers);
        await loadTemplateDetails();
      } catch (error) {
        // Failed to delete list
      }
    },
    [template.id, accessToken, loadTemplateDetails],
  );

  const handleAddCardType = useCallback(
    async (typeName) => {
      if (cardTypes.some((ct) => ct.typeName === typeName)) return;

      try {
        const headers = { Authorization: `Bearer ${accessToken}` };
        const typeOption = CARD_TYPE_OPTIONS.find((opt) => opt.value === typeName);

        await api.createBoardTemplateCardType(
          template.id,
          { typeName, color: typeOption?.color || 'grey' },
          headers,
        );

        await loadTemplateDetails();
      } catch (error) {
        // Failed to add card type
      }
    },
    [template.id, cardTypes, accessToken, loadTemplateDetails],
  );

  const handleDeleteCardType = useCallback(
    async (cardTypeId) => {
      try {
        const headers = { Authorization: `Bearer ${accessToken}` };
        await api.deleteBoardTemplateCardType(template.id, cardTypeId, headers);
        await loadTemplateDetails();
      } catch (error) {
        // Failed to delete card type
      }
    },
    [template.id, accessToken, loadTemplateDetails],
  );

  const availableCardTypes = CARD_TYPE_OPTIONS.filter(
    (opt) => !cardTypes.some((ct) => ct.typeName === opt.value),
  );

  const panes = [
    {
      menuItem: t('common.general'),
      render: () => (
        <Tab.Pane>
          <Form>
            <Form.Field>
              <Form.Input
                label={t('common.name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Field>

            <Form.Field>
              <label htmlFor="template-description">{t('common.description')}</label>
              <TextArea
                id="template-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </Form.Field>

            <Form.Field>
              <Checkbox
                label={t('common.lockLists')}
                checked={isListsLocked}
                onChange={(e, { checked }) => setIsListsLocked(checked)}
              />
              <div className={styles.helpText}>{t('common.lockListsHelp')}</div>
            </Form.Field>

            <Button primary onClick={handleSaveBasicInfo}>
              {t('action.save')}
            </Button>
          </Form>
        </Tab.Pane>
      ),
    },
    {
      menuItem: `${t('common.templateLists')} (${lists.length})`,
      render: () => (
        <Tab.Pane>
          <div className={styles.section}>
            <div className={styles.addForm}>
              <Input
                fluid
                placeholder={t('common.listName')}
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddList()}
                action={
                  <Button
                    primary
                    icon="plus"
                    onClick={handleAddList}
                    disabled={!newListName.trim()}
                  />
                }
              />
            </div>

            {lists.length === 0 ? (
              <div className={styles.emptyState}>{t('common.noListsYet')}</div>
            ) : (
              <List divided relaxed>
                {lists.map((list) => (
                  <List.Item key={list.id} className={styles.listItem}>
                    <List.Content floated="right">
                      <Button
                        size="mini"
                        icon="trash"
                        negative
                        onClick={() => handleDeleteList(list.id)}
                      />
                    </List.Content>
                    <List.Content>
                      <List.Header>{list.name}</List.Header>
                    </List.Content>
                  </List.Item>
                ))}
              </List>
            )}
          </div>
        </Tab.Pane>
      ),
    },
    {
      menuItem: `${t('common.cardTypes')} (${cardTypes.length})`,
      render: () => (
        <Tab.Pane>
          <div className={styles.section}>
            <div className={styles.addForm}>
              <Dropdown
                placeholder={t('common.selectCardType')}
                fluid
                selection
                options={availableCardTypes}
                onChange={(e, { value }) => handleAddCardType(value)}
                value=""
              />
            </div>

            {cardTypes.length === 0 ? (
              <div className={styles.emptyState}>
                {t('common.noCardTypesYet')}
                <div className={styles.helpText}>{t('common.allCardTypesAllowed')}</div>
              </div>
            ) : (
              <>
                <div className={styles.helpText} style={{ marginBottom: '1rem' }}>
                  {t('common.onlySelectedTypesAllowed')}
                </div>
                <List divided relaxed>
                  {cardTypes.map((cardType) => (
                    <List.Item key={cardType.id} className={styles.listItem}>
                      <List.Content floated="right">
                        <Button
                          size="mini"
                          icon="trash"
                          negative
                          onClick={() => handleDeleteCardType(cardType.id)}
                        />
                      </List.Content>
                      <List.Content>
                        <List.Header>
                          <Icon name="tag" style={{ color: cardType.color || 'grey' }} />
                          {cardType.typeName}
                        </List.Header>
                      </List.Content>
                    </List.Item>
                  ))}
                </List>
              </>
            )}
          </div>
        </Tab.Pane>
      ),
    },
  ];

  return (
    <Modal open onClose={onClose} size="small" closeIcon>
      <Modal.Header>{template.name}</Modal.Header>
      <Modal.Content>
        {isLoading ? (
          <div className={styles.loader}>Loading...</div>
        ) : (
          <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
        )}
      </Modal.Content>
    </Modal>
  );
});

TemplateDetailsModal.propTypes = {
  template: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    isListsLocked: PropTypes.bool,
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default TemplateDetailsModal;
