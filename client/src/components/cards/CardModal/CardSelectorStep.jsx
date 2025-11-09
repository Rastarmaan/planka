/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Icon, Input } from 'semantic-ui-react';
import { Popup } from '../../../lib/custom-ui';

import entryActions from '../../../entry-actions';
import selectors from '../../../selectors';
import { isListArchiveOrTrash } from '../../../utils/record-helpers';

import styles from './CardSelectorStep.module.scss';

const CardSelectorStep = React.memo(({ currentCardId, excludeCardIds, onSelect, onBack }) => {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const [searchValue, setSearchValue] = useState('');

  const { availableCards } = useSelector((state) => {
    const card = selectors.selectCardById(state, currentCardId);
    if (!card) return { currentCard: null, availableCards: [] };

    const lists = selectors.selectAvailableListsForCurrentBoard(state);
    if (!lists || lists.length === 0) return { currentCard: card, availableCards: [] };

    const cards = [];

    // Collect all cards from all lists in the current board
    lists.forEach((list) => {
      const cardIds = selectors.selectCardIdsByListId(state, list.id);
      cardIds.forEach((cardId) => {
        const c = selectors.selectCardById(state, cardId);
        if (c && c.id !== currentCardId && !excludeCardIds.includes(c.id)) {
          cards.push({ ...c, listName: list.name, listId: list.id });
        }
      });
    });

    // Filter by search
    const filtered = searchValue
      ? cards.filter((c) => c.name.toLowerCase().includes(searchValue.toLowerCase()))
      : cards;

    return { currentCard: card, availableCards: filtered };
  });

  const handleSearchChange = useCallback((e) => {
    setSearchValue(e.target.value);
  }, []);

  const handleCardClick = useCallback(
    (card) => {
      dispatch(entryActions.addDependencyToCard(null, currentCardId, card.id));
      onSelect(card);
    },
    [dispatch, currentCardId, onSelect],
  );

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('action.selectCard', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Input
          fluid
          icon="search"
          placeholder={t('action.searchCards')}
          value={searchValue}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
        <div className={styles.cardList}>
          {availableCards.length > 0 ? (
            availableCards.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                list={{ id: card.listId, name: card.listName }}
                onClick={() => handleCardClick(card)}
              />
            ))
          ) : (
            <div className={styles.emptyMessage}>
              {searchValue
                ? t('common.noCardsFound')
                : t('common.noCardsAvailable', { context: 'dependencies' })}
            </div>
          )}
        </div>
      </Popup.Content>
    </>
  );
});

CardSelectorStep.propTypes = {
  currentCardId: PropTypes.string.isRequired,
  excludeCardIds: PropTypes.arrayOf(PropTypes.string),
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

CardSelectorStep.defaultProps = {
  excludeCardIds: [],
  onBack: undefined,
};

const CardItem = React.memo(({ card, list, onClick }) => {
  const isArchived = list && isListArchiveOrTrash(list);
  const isCompleted = card.isClosed;

  return (
    <div
      className={`${styles.cardItem} ${isCompleted ? styles.completed : ''} ${
        isArchived ? styles.archived : ''
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onClick()}
    >
      <div className={styles.cardInfo}>
        <div className={styles.cardName}>
          {isCompleted && <Icon name="check circle" className={styles.completedIcon} />}
          {card.name}
        </div>
        {list && <div className={styles.cardList}>{list.name}</div>}
      </div>
    </div>
  );
});

CardItem.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    isClosed: PropTypes.bool,
    listId: PropTypes.string.isRequired,
  }).isRequired,
  list: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),
  onClick: PropTypes.func.isRequired,
};

CardItem.defaultProps = {
  list: null,
};

export default CardSelectorStep;
