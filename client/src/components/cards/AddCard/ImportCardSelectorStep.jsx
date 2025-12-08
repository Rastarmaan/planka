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
import { UserRoles } from '../../../constants/Enums';

import styles from '../CardModal/CardSelectorStep.module.scss';

const makeSelectProjectsAndBoardsForImport = () =>
  createSelector(
    orm,
    (state) => {
      const currentUser = selectors.selectCurrentUser(state);
      return currentUser;
    },
    ({ Board, User }, currentUser) => {
      if (!currentUser) {
        return { projects: [], boardsByProject: {} };
      }

      const currentUserModel = User.withId(currentUser.id);
      const isAdmin =
        currentUser.role === UserRoles.ADMIN || currentUser.role === UserRoles.MANAGER;
      const projectsMap = new Map();
      const boardsByProject = {};

      Board.all()
        .toModelArray()
        .forEach((boardModel) => {
          if (isAdmin || boardModel.isAvailableForUser(currentUserModel)) {
            const projectModel = boardModel.project;
            if (!projectModel) return;

            const projectId = projectModel.id;
            const isFetched = boardModel.lists.count() > 0;

            if (!projectsMap.has(projectId)) {
              projectsMap.set(projectId, {
                id: projectId,
                name: projectModel.ref.name,
              });
              boardsByProject[projectId] = [];
            }

            boardsByProject[projectId].push({
              id: boardModel.id,
              name: boardModel.ref.name,
              projectId,
              isFetched,
            });
          }
        });

      const projects = Array.from(projectsMap.values()).sort((a, b) =>
        (a.name || '').localeCompare(b.name || ''),
      );

      Object.keys(boardsByProject).forEach((projectId) => {
        boardsByProject[projectId].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      });

      return { projects, boardsByProject };
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
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState('');
  const [isLoadingBoard, setIsLoadingBoard] = useState(false);

  const dispatch = useDispatch();
  const currentBoard = useSelector(selectors.selectCurrentBoard);

  const selectProjectsAndBoards = useMemo(() => makeSelectProjectsAndBoardsForImport(), []);
  const selectCardsByBoardId = useMemo(() => makeSelectCardsByBoardId(), []);

  const { projects, boardsByProject } = useSelector(selectProjectsAndBoards);

  const projectOptions = useMemo(
    () =>
      projects
        .filter((project) => project.id !== currentBoard?.projectId)
        .map((project) => ({
          key: project.id,
          value: project.id,
          text: project.name,
        })),
    [projects, currentBoard?.projectId],
  );

  const boardOptions = useMemo(() => {
    if (!selectedProjectId || !boardsByProject[selectedProjectId]) {
      return [];
    }
    return boardsByProject[selectedProjectId]
      .filter((board) => board.id !== currentBoard?.id)
      .map((board) => ({
        key: board.id,
        value: board.id,
        text: board.name,
      }));
  }, [selectedProjectId, boardsByProject, currentBoard?.id]);

  const selectedBoardInfo = useMemo(() => {
    if (!selectedProjectId || !selectedBoardId || !boardsByProject[selectedProjectId]) {
      return null;
    }
    return boardsByProject[selectedProjectId].find((b) => b.id === selectedBoardId);
  }, [selectedProjectId, selectedBoardId, boardsByProject]);

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

  const availableCards = useMemo(() => {
    if (!searchValue) {
      return cardsInSelectedBoard;
    }
    return cardsInSelectedBoard.filter((card) =>
      card.name.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [cardsInSelectedBoard, searchValue]);

  const handleProjectChange = useCallback((_, { value }) => {
    setSelectedProjectId(value);
    setSelectedBoardId('');
    setSearchValue('');
  }, []);

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
            search
            placeholder={t('common.selectProject')}
            options={projectOptions}
            value={selectedProjectId}
            onChange={handleProjectChange}
            className={styles.boardDropdown}
          />
        </div>
        {selectedProjectId && (
          <div className={styles.boardSelector}>
            <Dropdown
              fluid
              selection
              search
              placeholder={t('common.selectBoard')}
              options={boardOptions}
              value={selectedBoardId}
              onChange={handleBoardChange}
              className={styles.boardDropdown}
            />
          </div>
        )}
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
