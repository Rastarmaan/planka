/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Form, Input, Popup } from 'semantic-ui-react';

import selectors from '../../../selectors';
import Item from './Item';

import styles from './SubTasksStep.module.scss';

const SubTasksStep = React.memo(({ currentCardId, onSelect, onCreate, onClose }) => {
  const [t] = useTranslation();
  const [search, setSearch] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const inputRef = useRef(null);

  const projectCards = useSelector(selectors.selectProjectCardsForCurrentBoard);

  const availableCards = useMemo(() => {
    return projectCards.filter((card) => card.id !== currentCardId);
  }, [projectCards, currentCardId]);

  const filteredCards = useMemo(() => {
    if (!search) {
      return availableCards;
    }

    const searchLower = search.toLowerCase();
    return availableCards.filter((card) => card.name.toLowerCase().includes(searchLower));
  }, [availableCards, search]);

  const handleSearchChange = useCallback((event) => {
    setSearch(event.target.value);
  }, []);

  const handleCardSelect = useCallback(
    (cardId) => {
      onSelect(cardId);
      if (onClose) {
        onClose();
      }
    },
    [onSelect, onClose],
  );

  const handleNewTaskNameChange = useCallback((event) => {
    setNewTaskName(event.target.value);
  }, []);

  const handleCreateSubTask = useCallback(() => {
    if (newTaskName.trim() && onCreate) {
      onCreate(newTaskName.trim());
      setNewTaskName('');
      if (onClose) {
        onClose();
      }
    }
  }, [newTaskName, onCreate, onClose]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter' && newTaskName.trim()) {
        event.preventDefault();
        handleCreateSubTask();
      }
    },
    [newTaskName, handleCreateSubTask],
  );

  return (
    <>
      <Popup.Header>
        <Input
          fluid
          transparent
          inverted
          icon="search"
          iconPosition="left"
          placeholder={t('common.searchSubTasks')}
          value={search}
          onChange={handleSearchChange}
        />
      </Popup.Header>
      <Popup.Content>
        {onCreate && (
          <div className={styles.createSection}>
            <Form onSubmit={handleCreateSubTask}>
              <Form.Field>
                <Input
                  ref={inputRef}
                  fluid
                  placeholder={t('common.enterSubTaskName')}
                  value={newTaskName}
                  onChange={handleNewTaskNameChange}
                  onKeyDown={handleKeyDown}
                  action={{
                    color: 'blue',
                    icon: 'plus',
                    content: t('action.create'),
                    onClick: handleCreateSubTask,
                    disabled: !newTaskName.trim(),
                  }}
                />
              </Form.Field>
            </Form>
          </div>
        )}
      </Popup.Content>
      <Popup.Content>
        <div className={styles.items}>
          {filteredCards.map((card) => (
            <Item key={card.id} id={card.id} name={card.name} onSelect={handleCardSelect} />
          ))}
          {filteredCards.length === 0 && (
            <div className={styles.message}>
              {search ? t('common.noSubTasksFound') : t('common.noSubTasksAvailable')}
            </div>
          )}
        </div>
      </Popup.Content>
    </>
  );
});

SubTasksStep.propTypes = {
  currentCardId: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  onCreate: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

SubTasksStep.defaultProps = {
  onCreate: undefined,
};

export default SubTasksStep;
