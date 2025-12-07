/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Form, Icon, TextArea } from 'semantic-ui-react';
import { useClickAwayListener, useDidUpdate, usePrevious, useToggle } from '../../../lib/hooks';
import { usePopup } from '../../../lib/popup';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useClosable, useForm, useNestedRef } from '../../../hooks';
import { isModifierKeyPressed } from '../../../utils/event-helpers';
import { getTextDirectionStyles } from '../../../utils/text-direction';
import { CardTypeIcons } from '../../../constants/Icons';
import { UserRoles } from '../../../constants/Enums';
import SelectCardTypeStep from '../SelectCardTypeStep';
import ImportCardSelectorStep from './ImportCardSelectorStep';

import styles from './AddCard.module.scss';

const DEFAULT_DATA = {
  name: '',
  weight: 1,
};

const AddCard = React.memo(({ isOpened, className, listId, onCreate, onClose }) => {
  const dispatch = useDispatch();
  const board = useSelector(selectors.selectCurrentBoard);
  const currentUser = useSelector(selectors.selectCurrentUser);

  const {
    defaultCardType: defaultType,
    limitCardTypesToDefaultOne: limitTypesToDefaultOne,
    cardTypes,
  } = board;

  const canImportCard = useMemo(() => {
    if (currentUser?.role === UserRoles.ADMIN || currentUser?.role === UserRoles.MANAGER)
      return true;

    const currentUserMembership = currentUser?.boardMemberships?.find(
      (m) => m.boardId === board.id,
    );
    return currentUserMembership?.role === 'editor';
  }, [currentUser, board.id]);

  const initialCardType = useMemo(() => {
    if (cardTypes && cardTypes.length > 0) {
      return cardTypes[0];
    }
    return defaultType;
  }, [cardTypes, defaultType]);

  const [t, i18n] = useTranslation();
  const prevDefaultType = usePrevious(initialCardType);

  const [data, handleFieldChange, setData] = useForm(() => ({
    ...DEFAULT_DATA,
    type: initialCardType,
  }));

  const inputDirectionStyles = useMemo(
    () => getTextDirectionStyles(data.name, i18n.language),
    [data.name, i18n.language],
  );

  const [focusNameFieldState, focusNameField] = useToggle();
  const [isClosableActiveRef, activateClosable, deactivateClosable] = useClosable();

  const [nameFieldRef, handleNameFieldRef] = useNestedRef();
  const [submitButtonRef, handleSubmitButtonRef] = useNestedRef();
  const [selectTypeButtonRef, handleSelectTypeButtonRef] = useNestedRef();
  const [importButtonRef, handleImportButtonRef] = useNestedRef();

  // const handleWeightChange = useCallback(
  //   (event) => {
  //     const value = parseInt(event.target.value, 10);
  //     if (!Number.isNaN(value) && value >= 1 && value <= 10) {
  //       setData((prevData) => ({
  //         ...prevData,
  //         weight: value,
  //       }));
  //     } else if (event.target.value === '') {
  //       setData((prevData) => ({
  //         ...prevData,
  //         weight: '',
  //       }));
  //     }
  //   },
  //   [setData],
  // );

  const submit = useCallback(
    (autoOpen) => {
      const cleanData = {
        ...data,
        name: data.name.trim(),
      };

      if (!cleanData.name) {
        nameFieldRef.current.select();
        return;
      }

      onCreate(cleanData, autoOpen);

      setData({
        ...DEFAULT_DATA,
        type: initialCardType,
        weight: 1,
      });

      if (autoOpen) {
        onClose();
      } else {
        focusNameField();
      }
    },
    [onCreate, onClose, initialCardType, data, setData, focusNameField, nameFieldRef],
  );

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const handleTypeSelect = useCallback(
    (type) => {
      setData((prevData) => ({
        ...prevData,
        type,
      }));
    },
    [setData],
  );

  const handleFieldKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case 'Enter':
          event.preventDefault();
          submit(isModifierKeyPressed(event));

          break;
        case 'Escape':
          onClose();

          break;
        default:
      }
    },
    [onClose, submit],
  );

  const handleSelectTypeClose = useCallback(() => {
    deactivateClosable();
    nameFieldRef.current.focus();
  }, [deactivateClosable, nameFieldRef]);

  const handleImportCardSelect = useCallback(
    (card) => {
      // eslint-disable-next-line no-console
      console.log('[AddCard] handleImportCardSelect called with:', card);
      // eslint-disable-next-line no-console
      console.log('[AddCard] listId:', listId);

      if (!listId) {
        // eslint-disable-next-line no-console
        console.error('[AddCard] No listId provided!');
        return;
      }

      // eslint-disable-next-line no-console
      console.log('[AddCard] Dispatching importAndSyncCard action');
      dispatch(
        entryActions.importAndSyncCard(card.id, listId, {
          name: card.name,
        }),
      );

      onClose();
    },
    [dispatch, listId, onClose],
  );

  const handleImportCardClose = useCallback(() => {
    deactivateClosable();
  }, [deactivateClosable]);

  const handleAwayClick = useCallback(() => {
    if (!isOpened || isClosableActiveRef.current) {
      return;
    }

    onClose();
  }, [isOpened, onClose, isClosableActiveRef]);

  const handleClickAwayCancel = useCallback(() => {
    nameFieldRef.current.focus();
  }, [nameFieldRef]);

  const clickAwayProps = useClickAwayListener(
    [nameFieldRef, submitButtonRef, selectTypeButtonRef, importButtonRef],
    handleAwayClick,
    handleClickAwayCancel,
  );

  useEffect(() => {
    if (isOpened) {
      nameFieldRef.current.focus();
    }
  }, [isOpened, nameFieldRef]);

  useEffect(() => {
    if (!isOpened && initialCardType !== prevDefaultType) {
      setData((prevData) => ({
        ...prevData,
        type: initialCardType,
      }));
    }
  }, [isOpened, initialCardType, prevDefaultType, setData]);

  useDidUpdate(() => {
    nameFieldRef.current.focus();
  }, [focusNameFieldState]);

  const SelectCardTypePopup = usePopup(SelectCardTypeStep, {
    onOpen: activateClosable,
    onClose: handleSelectTypeClose,
  });

  const ImportCardPopup = usePopup(ImportCardSelectorStep, {
    onOpen: activateClosable,
    onClose: handleImportCardClose,
  });

  return (
    <Form
      className={classNames(className, !isOpened && styles.wrapperClosed)}
      onSubmit={handleSubmit}
    >
      <div className={styles.fieldWrapper}>
        <TextArea
          {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
          ref={handleNameFieldRef}
          as={TextareaAutosize}
          name="name"
          value={data.name}
          placeholder={t('common.enterCardTitle')}
          maxLength={1024}
          minRows={3}
          className={styles.field}
          style={inputDirectionStyles}
          onKeyDown={handleFieldKeyDown}
          onChange={handleFieldChange}
        />
      </div>

      <div className={styles.controls}>
        <Button
          {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
          positive
          ref={handleSubmitButtonRef}
          content={t('action.addCard')}
          className={styles.button}
        />
        <SelectCardTypePopup defaultValue={data.type} onSelect={handleTypeSelect}>
          <Button
            {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
            ref={handleSelectTypeButtonRef}
            type="button"
            disabled={limitTypesToDefaultOne}
            className={classNames(styles.button, styles.selectTypeButton)}
          >
            <Icon name={CardTypeIcons[data.type]} className={styles.selectTypeButtonIcon} />
            {t(`common.${data.type}`)}
          </Button>
        </SelectCardTypePopup>
        {canImportCard && (
          <ImportCardPopup onSelect={handleImportCardSelect}>
            <Button
              {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
              ref={handleImportButtonRef}
              type="button"
              className={classNames(styles.button, styles.importButton)}
              title={t('action.importCard')}
            >
              <Icon name="download" />
            </Button>
          </ImportCardPopup>
        )}
      </div>
    </Form>
  );
});

AddCard.propTypes = {
  isOpened: PropTypes.bool,
  className: PropTypes.string,
  listId: PropTypes.string.isRequired,
  onCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

AddCard.defaultProps = {
  isOpened: true,
  className: undefined,
};

export default AddCard;
