/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Icon, Input, Dropdown } from 'semantic-ui-react';
import { createSelector } from 'redux-orm';
import { Popup } from '../../../lib/custom-ui';

import orm from '../../../orm';
import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { isListArchiveOrTrash } from '../../../utils/record-helpers';

import styles from '../CardModal/CardSelectorStep.module.scss';

const makeSelectBoardsForImport = () =>
  createSelector(
    orm,
    (state) => {
      const currentUser = selectors.selectCurrentUser(state);
      return currentUser;
    },
    ({ Board, User }, currentUser) => {
      if (!currentUser) {
        return [];
      }

      const currentUserModel = User.withId(currentUser.id);
      const isAdmin = currentUser.role === 'admin';
      const boards = [];

      Board.all()
        .toModelArray()
        .forEach((boardModel) => {
          if (isAdmin || boardModel.isAvailableForUser(currentUserModel)) {
            const projectModel = boardModel.project;
            const isFetched = boardModel.lists.count() > 0;

            boards.push({
              id: boardModel.id,
              name: boardModel.ref.name,
              projectId: projectModel ? projectModel.id : null,
              projectName: projectModel ? projectModel.ref.name : 'Unknown Project',
              isFetched,
            });
          }
        });

      return boards.sort((a, b) => {
        const projectCompare = (a.projectName || '').localeCompare(b.projectName || '');
        if (projectCompare !== 0) return projectCompare;
        return (a.name || '').localeCompare(b.name || '');
      });
    },
  );

const makeSelectCardsByBoardId = () =>
  createSelector(
    orm,
    (_, boardId) => boardId,
    ({ Board }, boardId) => {
      if (!boardId) {
        return [];
      }

      const boardModel = Board.withId(boardId);
      if (!boardModel) {
        return [];
      }

      const cards = [];
      boardModel.lists.toModelArray().forEach((listModel) => {
        const list = listModel.ref;

        // Skip archive and trash lists
        if (isListArchiveOrTrash(list)) {
          return;
        }

        listModel.cards.toModelArray().forEach((cardModel) => {
          const card = cardModel.ref;

          cards.push({
            ...card,
            listName: list.name,
          });
        });
      });

      return cards;
    },
  );

const ImportCardSelectorStep = React.memo(({ onSelect, onBack }) => {
  const [t] = useTranslation();
  const [searchValue, setSearchValue] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState('');
  const [isLoadingBoard, setIsLoadingBoard] = useState(false);

  const dispatch = useDispatch();
  const currentBoard = useSelector(selectors.selectCurrentBoard);

  const selectBoardsForImport = useMemo(() => makeSelectBoardsForImport(), []);
  const selectCardsByBoardId = useMemo(() => makeSelectCardsByBoardId(), []);

  const allBoardsForImport = useSelector(selectBoardsForImport);

  const selectedBoardInfo = useMemo(
    () => allBoardsForImport.find((b) => b.id === selectedBoardId),
    [allBoardsForImport, selectedBoardId],
  );

  const cardsInSelectedBoard = useSelector((state) => selectCardsByBoardId(state, selectedBoardId));

  useEffect(() => {
    if (selectedBoardId && selectedBoardInfo && !selectedBoardInfo.isFetched) {
      setIsLoadingBoard(true);
      dispatch(entryActions.fetchBoard(selectedBoardId));
    }
  }, [selectedBoardId, selectedBoardInfo, dispatch]);

  useEffect(() => {
    if (selectedBoardInfo?.isFetched) {
      setIsLoadingBoard(false);
    }
  }, [selectedBoardInfo?.isFetched]);

  const boards = useMemo(
    () =>
      allBoardsForImport
        .filter((board) => board.id !== currentBoard?.id)
        .map((board) => ({
          key: board.id,
          value: board.id,
          text: `${board.projectName} / ${board.name}`,
        })),
    [allBoardsForImport, currentBoard?.id],
  );

  const availableCards = useMemo(() => {
    if (!searchValue) {
      return cardsInSelectedBoard;
    }
    return cardsInSelectedBoard.filter((card) =>
      card.name.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [cardsInSelectedBoard, searchValue]);

  const handleBoardChange = useCallback((_, { value }) => {
    setSelectedBoardId(value);
    setSearchValue('');
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchValue(e.target.value);
  }, []);

  const handleCardClick = useCallback(
    (card) => {
      // eslint-disable-next-line no-console
      console.log('[ImportCardSelector] Card clicked:', card);
      onSelect(card);
    },
    [onSelect],
  );

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('action.importCard', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <div className={styles.boardSelector}>
          <Dropdown
            fluid
            selection
            placeholder={t('common.selectBoard')}
            options={boards}
            value={selectedBoardId}
            onChange={handleBoardChange}
            className={styles.boardDropdown}
          />
        </div>
        {selectedBoardId && (
          <>
            <Input
              fluid
              icon="search"
              placeholder={t('action.searchCards')}
              value={searchValue}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
            <div className={styles.cardList}>
              {isLoadingBoard && (
                <div className={styles.emptyMessage}>
                  {t('common.loading', { defaultValue: 'Loading...' })}
                </div>
              )}
              {!isLoadingBoard && !selectedBoardInfo?.isFetched && (
                <div className={styles.emptyMessage}>
                  {t('common.loadingBoardData', {
                    defaultValue: 'Loading board data...',
                  })}
                </div>
              )}
              {!isLoadingBoard &&
                selectedBoardInfo?.isFetched &&
                availableCards.length > 0 &&
                availableCards.map((card) => (
                  <CardItem
                    key={card.id}
                    card={card}
                    list={{ id: card.listId, name: card.listName }}
                    onClick={() => handleCardClick(card)}
                  />
                ))}
              {!isLoadingBoard && selectedBoardInfo?.isFetched && availableCards.length === 0 && (
                <div className={styles.emptyMessage}>
                  {searchValue ? t('common.noCardsFound') : t('common.noCardsAvailableInBoard')}
                </div>
              )}
            </div>
          </>
        )}
      </Popup.Content>
    </>
  );
});

ImportCardSelectorStep.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

ImportCardSelectorStep.defaultProps = {
  onBack: undefined,
};

const CardItem = React.memo(({ card, list, onClick }) => {
  const isCompleted = card.isClosed;

  let cardTypeIcon = 'tasks';
  if (card.type === 'story') {
    cardTypeIcon = 'book';
  } else if (card.type === 'epic') {
    cardTypeIcon = 'star';
  }

  return (
    <div
      className={styles.cardItem}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={styles.cardHeader}>
        <Icon name={cardTypeIcon} className={styles.cardTypeIcon} />
        <span className={isCompleted ? styles.cardNameCompleted : styles.cardName}>
          {card.name}
        </span>
      </div>
      {list && (
        <div className={styles.cardMeta}>
          <Icon name="list" size="small" />
          <span className={styles.listName}>{list.name}</span>
        </div>
      )}
    </div>
  );
});

CardItem.propTypes = {
  card: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  list: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onClick: PropTypes.func.isRequired,
};

CardItem.defaultProps = {
  list: undefined,
};

export default ImportCardSelectorStep;
