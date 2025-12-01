/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form, Modal } from 'semantic-ui-react';
import { Input } from '../../../lib/custom-ui';

const InputModal = React.memo(
  ({
    title,
    label,
    defaultValue,
    submitLabel,
    onSubmit,
    onClose,
    hasDescription = false,
    descriptionLabel,
    descriptionDefaultValue,
  }) => {
    const [t] = useTranslation();
    const [value, setValue] = useState(defaultValue || '');
    const [description, setDescription] = useState(descriptionDefaultValue || '');
    const inputRef = useRef(null);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, []);

    const handleSubmit = (e) => {
      e.preventDefault();
      const trimmedValue = value.trim();
      if (trimmedValue) {
        if (hasDescription) {
          onSubmit(trimmedValue, description.trim());
        } else {
          onSubmit(trimmedValue);
        }
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    return (
      <Modal open closeIcon size="tiny" onClose={onClose}>
        <Modal.Header>{title}</Modal.Header>
        <Modal.Content>
          <Form onSubmit={handleSubmit}>
            <Form.Field>
              <label htmlFor="input-field">{label}</label>
              <Input
                fluid
                ref={inputRef}
                id="input-field"
                name="name"
                value={value}
                maxLength={128}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </Form.Field>
            {hasDescription && (
              <Form.Field>
                <label htmlFor="description-field">{descriptionLabel}</label>
                <Input
                  fluid
                  id="description-field"
                  name="description"
                  value={description}
                  maxLength={500}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </Form.Field>
            )}
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button content={t('action.cancel')} onClick={onClose} />
          <Button
            positive
            icon="checkmark"
            content={submitLabel}
            disabled={!value.trim()}
            onClick={handleSubmit}
          />
        </Modal.Actions>
      </Modal>
    );
  },
);

InputModal.propTypes = {
  title: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  defaultValue: PropTypes.string,
  submitLabel: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  hasDescription: PropTypes.bool,
  descriptionLabel: PropTypes.string,
  descriptionDefaultValue: PropTypes.string,
};

InputModal.defaultProps = {
  defaultValue: '',
  hasDescription: false,
  descriptionLabel: '',
  descriptionDefaultValue: '',
};

export default InputModal;
