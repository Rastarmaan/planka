/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Form, Modal, TextArea } from 'semantic-ui-react';

import styles from './TemplateFormModal.module.scss';

const TemplateFormModal = React.memo(({ template, onSubmit, onClose }) => {
  const [t] = useTranslation();

  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [isListsLocked, setIsListsLocked] = useState(template?.isListsLocked || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || null,
        isListsLocked,
      });
      onClose();
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  }, [name, description, isListsLocked, onSubmit, onClose]);

  return (
    <Modal open onClose={onClose} size="small" closeIcon>
      <Modal.Header>
        {template ? t('action.editTemplate') : t('action.createTemplate')}
      </Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Field>
            <Form.Input
              label={t('common.name')}
              placeholder={t('common.templateName')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </Form.Field>

          <Form.Field>
            <label htmlFor="template-description">{t('common.description')}</label>
            <TextArea
              id="template-description"
              placeholder={t('common.description')}
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

          {!template && (
            <div className={styles.infoMessage}>
              <strong>Note:</strong> After creating the template, you can manage lists and card
              types in the template settings.
            </div>
          )}
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={onClose}>{t('action.cancel')}</Button>
        <Button
          primary
          loading={isSubmitting}
          disabled={!name.trim() || isSubmitting}
          onClick={handleSubmit}
        >
          {template ? t('action.save') : t('action.create')}
        </Button>
      </Modal.Actions>
    </Modal>
  );
});

TemplateFormModal.propTypes = {
  template: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    isListsLocked: PropTypes.bool,
  }),
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

TemplateFormModal.defaultProps = {
  template: null,
};

export default TemplateFormModal;
