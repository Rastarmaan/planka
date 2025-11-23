/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Input, Icon } from 'semantic-ui-react';

import styles from './InputModal.module.scss';

const InputModal = React.memo(({ title, label, defaultValue, submitLabel, onSubmit, onClose }) => {
  const [value, setValue] = useState(defaultValue || '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>{title}</h3>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        <Form onSubmit={handleSubmit}>
          <Form.Field>
            <label htmlFor="input-field">{label}</label>
            <Input
              ref={inputRef}
              id="input-field"
              fluid
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className={styles.input}
            />
          </Form.Field>
          <div className={styles.actions}>
            <Button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className={styles.createButton} disabled={!value.trim()}>
              {submitLabel}
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
});

InputModal.propTypes = {
  title: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  defaultValue: PropTypes.string,
  submitLabel: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

InputModal.defaultProps = {
  defaultValue: '',
};

export default InputModal;
