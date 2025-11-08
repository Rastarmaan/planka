/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Button, Form, Icon } from 'semantic-ui-react';
import { Input, Popup } from '../../../../lib/custom-ui';
import { useDidUpdate, useToggle } from '../../../../lib/hooks';

import entryActions from '../../../../entry-actions';
import { useForm, useNestedRef, useSteps } from '../../../../hooks';
import ImportStep from './ImportStep';

import styles from './AddStep.module.scss';

const StepTypes = {
  IMPORT: 'IMPORT',
  IMPORT_FROM_PLANKA: 'IMPORT_FROM_PLANKA',
};

const AddStep = React.memo(({ onClose, onOpenImportModal }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [data, handleFieldChange, setData] = useForm({
    name: '',
    import: null,
  });

  const [step, openStep, handleBack] = useSteps();
  const [focusNameFieldState, focusNameField] = useToggle();

  const [nameFieldRef, handleNameFieldRef] = useNestedRef('inputRef');

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      nameFieldRef.current.select();
      return;
    }

    dispatch(entryActions.createBoardInCurrentProject(cleanData));
    onClose();
  }, [onClose, dispatch, data, nameFieldRef]);

  const handleImportSelect = useCallback(
    (nextImport) => {
      setData((prevData) => ({
        ...prevData,
        import: nextImport,
      }));
    },
    [setData],
  );

  const handleImportBack = useCallback(() => {
    handleBack();
    focusNameField();
  }, [handleBack, focusNameField]);

  const handleImportClick = useCallback(() => {
    openStep(StepTypes.IMPORT);
  }, [openStep]);

  const handleImportFromPlanka = useCallback(() => {
    onClose();
    if (onOpenImportModal) {
      onOpenImportModal();
    }
  }, [onClose, onOpenImportModal]);

  useEffect(() => {
    nameFieldRef.current.focus({
      preventScroll: true,
    });
  }, [nameFieldRef]);

  useDidUpdate(() => {
    nameFieldRef.current.focus();
  }, [focusNameFieldState]);

  if (step && step.type === StepTypes.IMPORT) {
    return (
      <ImportStep
        onSelect={handleImportSelect}
        onBack={handleImportBack}
        onImportFromPlanka={handleImportFromPlanka}
      />
    );
  }

  return (
    <>
      <Popup.Header>
        {t('common.createBoard', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.text}>{t('common.title')}</div>
          <Input
            fluid
            ref={handleNameFieldRef}
            name="name"
            value={data.name}
            maxLength={128}
            className={styles.field}
            onChange={handleFieldChange}
          />
          <div className={styles.controls}>
            <Button positive content={t('action.createBoard')} className={styles.button} />
            <Button
              type="button"
              className={classNames(styles.button, styles.importButton)}
              onClick={handleImportClick}
            >
              <Icon
                name={data.import ? data.import.type : 'arrow down'}
                className={styles.importButtonIcon}
              />
              {data.import ? data.import.file.name : t('action.import')}
            </Button>
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

AddStep.propTypes = {
  onClose: PropTypes.func.isRequired,
  onOpenImportModal: PropTypes.func,
};

AddStep.defaultProps = {
  onOpenImportModal: undefined,
};

export default AddStep;
