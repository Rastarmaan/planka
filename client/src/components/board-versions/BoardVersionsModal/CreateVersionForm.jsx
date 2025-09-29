/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Form, TextArea } from 'semantic-ui-react';

import { useForm } from '../../../hooks';
import { isModifierKeyPressed } from '../../../utils/event-helpers';

import styles from './CreateVersionForm.module.scss';

const CreateVersionForm = React.memo(({ onSubmit, onCancel, isLoading }) => {
  const [t] = useTranslation();

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
    description: '',
  }));

  const nameFieldRef = useRef(null);

  const handleNameChange = useCallback(
    (event) => {
      const { name, value } = event.target;
      handleFieldChange(event, { type: 'text', name, value });
    },
    [handleFieldChange],
  );

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
      description: data.description.trim() || null,
    };

    if (!cleanData.name) {
      nameFieldRef.current?.select();
      return;
    }

    onSubmit(cleanData);
  }, [data, onSubmit, nameFieldRef]);

  const handleDescriptionKeyDown = useCallback(
    (event) => {
      if (isModifierKeyPressed(event) && event.key === 'Enter') {
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  useEffect(() => {
    nameFieldRef.current?.focus();
  }, []);

  return (
    <div className={styles.form}>
      <Form onSubmit={handleSubmit}>
        <div className={styles.fieldGroup}>
          <label htmlFor="version-name" className={styles.label}>
            {t('common.name', { defaultValue: 'Name' })}
          </label>
          <input
            id="version-name"
            ref={nameFieldRef}
            name="name"
            value={data.name}
            maxLength={255}
            readOnly={isLoading}
            className={styles.input}
            onChange={handleNameChange}
            placeholder={t('common.versionNamePlaceholder', {
              defaultValue: 'Enter version name...',
            })}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="version-description" className={styles.label}>
            {t('common.description', { defaultValue: 'Description' })}
          </label>
          <TextArea
            id="version-description"
            as={TextareaAutosize}
            name="description"
            value={data.description}
            maxLength={500}
            minRows={2}
            className={styles.textarea}
            onKeyDown={handleDescriptionKeyDown}
            onChange={handleFieldChange}
            placeholder={t('common.versionDescriptionPlaceholder', {
              defaultValue: 'Optional description for this version...',
            })}
          />
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            content={t('common.cancel', { defaultValue: 'Cancel' })}
            onClick={onCancel}
            disabled={isLoading}
          />
          <Button
            type="submit"
            primary
            icon="checkmark"
            content={t('action.createVersion', { defaultValue: 'Create Version' })}
            loading={isLoading}
            disabled={isLoading}
          />
        </div>
      </Form>
    </div>
  );
});

CreateVersionForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default CreateVersionForm;
