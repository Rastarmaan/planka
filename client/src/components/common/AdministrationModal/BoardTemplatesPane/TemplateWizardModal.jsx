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
  Step,
  TextArea,
} from 'semantic-ui-react';

import api from '../../../../api';
import selectors from '../../../../selectors';
import styles from './TemplateWizardModal.module.scss';

const CARD_TYPE_OPTIONS = [
  { key: 'project', value: 'project', text: 'Project', color: 'blue' },
  { key: 'story', value: 'story', text: 'Story', color: 'green' },
  { key: 'epic', value: 'epic', text: 'Epic', color: 'purple' },
];

const TemplateWizardModal = React.memo(({ template, onSubmit, onClose }) => {
  const [t] = useTranslation();
  const accessToken = useSelector(selectors.selectAccessToken);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Basic Info
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [isListsLocked, setIsListsLocked] = useState(template?.isListsLocked || false);

  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');

  const [selectedCardTypes, setSelectedCardTypes] = useState([]);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

  useEffect(() => {
    if (template?.id) {
      const loadTemplateData = async () => {
        try {
          setIsLoadingTemplate(true);
          const headers = { Authorization: `Bearer ${accessToken}` };
          const data = await api.getBoardTemplate(template.id, headers);

          if (data.included.lists) {
            setLists(data.included.lists);
          }

          if (data.included.cardTypes) {
            setSelectedCardTypes(data.included.cardTypes.map((ct) => ct.typeName));
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to load template data:', error);
        } finally {
          setIsLoadingTemplate(false);
        }
      };

      loadTemplateData();
    }
  }, [template?.id, accessToken]);

  const handleNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  }, []);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleAddList = useCallback(() => {
    if (!newListName.trim()) return;

    const position = lists.length > 0 ? Math.max(...lists.map((l) => l.position)) + 65536 : 65536;

    setLists((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        name: newListName,
        position,
      },
    ]);
    setNewListName('');
  }, [newListName, lists]);

  const handleDeleteList = useCallback((listId) => {
    setLists((prev) => prev.filter((l) => l.id !== listId));
  }, []);

  const handleCardTypeChange = useCallback((e, { value }) => {
    setSelectedCardTypes(value);
  }, []);

  const handleSubmit = useCallback(async () => {
    // eslint-disable-next-line no-console
    console.log('handleSubmit called');
    try {
      setIsSubmitting(true);
      const headers = { Authorization: `Bearer ${accessToken}` };

      const templateData = {
        name,
        description,
        isListsLocked,
      };

      // eslint-disable-next-line no-console
      console.log('Creating/updating template with data:', templateData);

      let templateId;
      let existingLists = [];
      let existingCardTypes = [];

      if (template) {
        // eslint-disable-next-line no-console
        console.log('Updating existing template:', template.id);
        await api.updateBoardTemplate(template.id, templateData, headers);
        templateId = template.id;

        const existingData = await api.getBoardTemplate(template.id, headers);
        existingLists = existingData.included.lists || [];
        existingCardTypes = existingData.included.cardTypes || [];

        // eslint-disable-next-line no-restricted-syntax
        for (const list of existingLists) {
          // eslint-disable-next-line no-await-in-loop
          await api.deleteBoardTemplateList(templateId, list.id, headers);
        }

        // eslint-disable-next-line no-restricted-syntax
        for (const cardType of existingCardTypes) {
          // eslint-disable-next-line no-await-in-loop
          await api.deleteBoardTemplateCardType(templateId, cardType.id, headers);
        }
      } else {
        // eslint-disable-next-line no-console
        console.log('Creating new template');
        const result = await api.createBoardTemplate(templateData, headers);
        // eslint-disable-next-line no-console
        console.log('Template created, result:', result);
        templateId = result.item.id;
      }

      // eslint-disable-next-line no-console
      console.log('Adding lists:', lists);
      // eslint-disable-next-line no-restricted-syntax
      for (const list of lists) {
        // eslint-disable-next-line no-await-in-loop
        await api.createBoardTemplateList(
          templateId,
          {
            name: list.name,
            position: list.position,
          },
          headers,
        );
      }

      // eslint-disable-next-line no-console
      console.log('Adding card types:', selectedCardTypes);
      // eslint-disable-next-line no-restricted-syntax
      for (const cardType of selectedCardTypes) {
        // eslint-disable-next-line no-await-in-loop
        await api.createBoardTemplateCardType(templateId, { typeName: cardType }, headers);
      }

      // eslint-disable-next-line no-console
      console.log('Calling onSubmit');
      await onSubmit();
      // eslint-disable-next-line no-console
      console.log('onSubmit completed');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to create/update template:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [accessToken, name, description, isListsLocked, lists, selectedCardTypes, template, onSubmit]);

  const canProceedFromStep1 = name.trim().length > 0;
  const canProceedFromStep2 = lists.length > 0;

  return (
    <Modal open onClose={onClose} size="large" closeIcon>
      <Modal.Header>
        <Icon name="file alternate outline" />
        {template ? t('action.editTemplate') : t('action.createTemplate')}
      </Modal.Header>

      <Modal.Content>
        <Step.Group fluid ordered attached="top">
          <Step active={currentStep === 1} completed={currentStep > 1}>
            <Step.Content>
              <Step.Title>{t('common.basicInfo')}</Step.Title>
              <Step.Description>{t('common.templateNameAndSettings')}</Step.Description>
            </Step.Content>
          </Step>

          <Step active={currentStep === 2} completed={currentStep > 2}>
            <Step.Content>
              <Step.Title>{t('common.lists')}</Step.Title>
              <Step.Description>{t('common.addTemplateListsDescription')}</Step.Description>
            </Step.Content>
          </Step>

          <Step active={currentStep === 3}>
            <Step.Content>
              <Step.Title>{t('common.cardTypes')}</Step.Title>
              <Step.Description>{t('common.selectAllowedCardTypes')}</Step.Description>
            </Step.Content>
          </Step>
        </Step.Group>

        {isLoadingTemplate ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Icon loading name="spinner" size="big" />
            <p>{t('common.loading')}</p>
          </div>
        ) : (
          <>
            {currentStep === 1 && (
              <Form>
                <Form.Field required>
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label>{t('common.name')}</label>
                  <Input
                    fluid
                    placeholder={t('common.enterTemplateName')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Field>

                <Form.Field>
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label>{t('common.description')}</label>
                  <TextArea
                    placeholder={t('common.enterTemplateDescription')}
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
              </Form>
            )}

            {currentStep === 2 && (
              <div className={styles.listsStep}>
                <div className={styles.addListForm}>
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
                  <div className={styles.helpText}>{t('common.addListsForYourWorkflow')}</div>
                </div>

                {lists.length === 0 ? (
                  <div className={styles.emptyState}>
                    <Icon name="list" size="huge" color="grey" />
                    <p>{t('common.noListsAddedYet')}</p>
                    <p className={styles.hint}>{t('common.addAtLeastOneList')}</p>
                  </div>
                ) : (
                  <List divided relaxed className={styles.listItems}>
                    {lists.map((list, index) => (
                      <List.Item key={list.id} className={styles.listItem}>
                        <Icon name="bars" className={styles.listIcon} />
                        <List.Content>
                          <List.Header className={styles.listHeader}>{list.name}</List.Header>
                          <List.Description className={styles.listDescription}>
                            {t('common.listPosition', { position: index + 1 })}
                          </List.Description>
                        </List.Content>
                        <List.Content floated="right">
                          <Button
                            icon="trash"
                            size="mini"
                            basic
                            color="red"
                            onClick={() => handleDeleteList(list.id)}
                          />
                        </List.Content>
                      </List.Item>
                    ))}
                  </List>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className={styles.cardTypesStep}>
                <Form>
                  <Form.Field>
                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                    <label>{t('common.allowedCardTypes')}</label>
                    <Dropdown
                      placeholder={t('common.selectCardTypes')}
                      fluid
                      multiple
                      selection
                      options={CARD_TYPE_OPTIONS}
                      value={selectedCardTypes}
                      onChange={handleCardTypeChange}
                    />
                    <div className={styles.helpText}>
                      {t('common.selectCardTypesAllowedInBoards')}
                    </div>
                  </Form.Field>
                </Form>

                {selectedCardTypes.length > 0 && (
                  <div className={styles.selectedTypes}>
                    <p className={styles.selectedLabel}>{t('common.selectedTypes')}:</p>
                    <div className={styles.typesList}>
                      {selectedCardTypes.map((type) => {
                        const option = CARD_TYPE_OPTIONS.find((opt) => opt.value === type);
                        return (
                          <div key={type} className={styles.typeTag}>
                            <Icon name="tag" color={option.color} />
                            {option.text}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedCardTypes.length === 0 && (
                  <div className={styles.emptyState}>
                    <Icon name="tags" size="huge" color="grey" />
                    <p>{t('common.noCardTypesSelected')}</p>
                    <p className={styles.hint}>{t('common.leaveEmptyToAllowAllTypes')}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Modal.Content>

      <Modal.Actions>
        {currentStep > 1 && (
          <Button onClick={handleBack} disabled={isSubmitting}>
            <Icon name="arrow left" />
            {t('action.back')}
          </Button>
        )}

        <Button onClick={onClose} disabled={isSubmitting}>
          {t('action.cancel')}
        </Button>

        {currentStep < 3 && (
          <Button
            primary
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !canProceedFromStep1) ||
              (currentStep === 2 && !canProceedFromStep2)
            }
          >
            {t('action.next')}
            <Icon name="arrow right" />
          </Button>
        )}

        {currentStep === 3 && (
          <Button primary onClick={handleSubmit} loading={isSubmitting} disabled={isSubmitting}>
            <Icon name="check" />
            {template ? t('action.save') : t('action.create')}
          </Button>
        )}
      </Modal.Actions>
    </Modal>
  );
});

TemplateWizardModal.propTypes = {
  template: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

TemplateWizardModal.defaultProps = {
  template: undefined,
};

export default TemplateWizardModal;
