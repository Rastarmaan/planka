/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Dropdown, Icon, Loader, Message } from 'semantic-ui-react';
import { createSelector } from 'redux-orm';
import { Popup } from '../../../lib/custom-ui';

import orm from '../../../orm';
import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';

import styles from './SyncCardStep.module.scss';

const makeSelectProjectsAndBoardsForSync = () =>
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
      const isAdmin = currentUser.role === 'admin';
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

const makeSelectListsByBoardId = () =>
  createSelector(
    orm,
    (_, boardId) => boardId,
    ({ Board }, boardId) => {
      if (!boardId) return [];

      const boardModel = Board.withId(boardId);
      if (!boardModel) return [];

      return boardModel.lists
        .toModelArray()
        .filter((list) => list.ref.type === 'active')
        .map((list) => ({
          id: list.id,
          name: list.ref.name,
          position: list.ref.position,
        }))
        .sort((a, b) => a.position - b.position);
    },
  );

const makeSelectSyncedCards = () =>
  createSelector(
    orm,
    (_, cardId) => cardId,
    ({ Card, Board }, cardId) => {
      if (!cardId) return [];

      const syncedCards = Card.all()
        .toModelArray()
        .filter((card) => card.ref.syncedFromCardId === cardId);

      return syncedCards.map((card) => {
        const boardModel = Board.withId(card.ref.boardId);
        const projectModel = boardModel?.project;

        return {
          id: card.id,
          name: card.ref.name,
          boardId: card.ref.boardId,
          boardName: boardModel?.ref.name || 'Unknown Board',
          projectName: projectModel?.ref.name || 'Unknown Project',
          isSyncEnabled: card.ref.isSyncEnabled,
        };
      });
    },
  );

const SyncCardStep = React.memo(({ cardId, onBack }) => {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState('');
  const [selectedListId, setSelectedListId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const currentBoard = useSelector(selectors.selectCurrentBoard);

  const selectProjectsAndBoards = useMemo(() => makeSelectProjectsAndBoardsForSync(), []);
  const selectListsByBoardId = useMemo(() => makeSelectListsByBoardId(), []);
  const selectSyncedCards = useMemo(() => makeSelectSyncedCards(), []);

  const { projects, boardsByProject } = useSelector(selectProjectsAndBoards);
  const lists = useSelector((state) => selectListsByBoardId(state, selectedBoardId));
  const syncedCards = useSelector((state) => selectSyncedCards(state, cardId));

  const selectedBoardInfo = useMemo(() => {
    if (!selectedProjectId || !selectedBoardId || !boardsByProject[selectedProjectId]) {
      return null;
    }
    return boardsByProject[selectedProjectId].find((b) => b.id === selectedBoardId);
  }, [selectedProjectId, selectedBoardId, boardsByProject]);

  useEffect(() => {
    if (selectedBoardId && selectedBoardInfo && !selectedBoardInfo.isFetched) {
      dispatch(entryActions.fetchBoard(selectedBoardId));
    }
  }, [selectedBoardId, selectedBoardInfo, dispatch]);

  const projectOptions = useMemo(
    () =>
      projects.map((project) => ({
        key: project.id,
        value: project.id,
        text: project.name,
      })),
    [projects],
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

  const listOptions = useMemo(
    () =>
      lists.map((list) => ({
        key: list.id,
        value: list.id,
        text: list.name,
      })),
    [lists],
  );

  const handleProjectChange = useCallback((_, { value }) => {
    setSelectedProjectId(value);
    setSelectedBoardId('');
    setSelectedListId('');
    setError(null);
  }, []);

  const handleBoardChange = useCallback((_, { value }) => {
    setSelectedBoardId(value);
    setSelectedListId('');
    setError(null);
  }, []);

  const handleListChange = useCallback((_, { value }) => {
    setSelectedListId(value);
    setError(null);
  }, []);

  const handleSync = useCallback(async () => {
    if (!selectedListId) {
      setError(t('common.pleaseSelectList'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    dispatch(
      entryActions.syncCardToBoard(cardId, selectedListId, {
        onSuccess: () => {
          setIsSubmitting(false);
          setSelectedProjectId('');
          setSelectedBoardId('');
          setSelectedListId('');
        },
        onError: (err) => {
          setIsSubmitting(false);
          setError(err.message || t('common.syncFailed'));
        },
      }),
    );
  }, [cardId, selectedListId, dispatch, t]);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('action.syncCard', { context: 'title', defaultValue: 'Sync Card' })}
      </Popup.Header>
      <Popup.Content>
        {error && (
          <Message negative size="small">
            <p>{error}</p>
          </Message>
        )}

        {syncedCards.length > 0 && (
          <div className={styles.syncedSection}>
            <div className={styles.sectionTitle}>
              <Icon name="linkify" />
              {t('common.syncedTo', { defaultValue: 'Synced to' })}
            </div>
            <div className={styles.syncedList}>
              {syncedCards.map((syncedCard) => (
                <div key={syncedCard.id} className={styles.syncedItem}>
                  <div className={styles.syncedInfo}>
                    <span className={styles.syncedProject}>{syncedCard.projectName}</span>
                    <Icon name="angle right" size="small" />
                    <span className={styles.syncedBoard}>{syncedCard.boardName}</span>
                  </div>
                  <div className={styles.syncedCardName}>
                    <Icon name="clone outline" size="small" />
                    {syncedCard.name}
                  </div>
                  {syncedCard.isSyncEnabled ? (
                    <span className={styles.syncActive}>
                      <Icon name="sync" size="small" />
                      {t('common.syncActive', { defaultValue: 'Active' })}
                    </span>
                  ) : (
                    <span className={styles.syncPaused}>
                      <Icon name="pause" size="small" />
                      {t('common.syncPaused', { defaultValue: 'Paused' })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.syncNewSection}>
          <div className={styles.sectionTitle}>
            <Icon name="plus" />
            {t('common.syncToNewBoard', { defaultValue: 'Sync to another board' })}
          </div>

          <div className={styles.dropdownGroup}>
            <Dropdown
              fluid
              selection
              search
              placeholder={t('common.selectProject')}
              options={projectOptions}
              value={selectedProjectId}
              onChange={handleProjectChange}
              className={styles.dropdown}
            />
          </div>

          {selectedProjectId && (
            <div className={styles.dropdownGroup}>
              <Dropdown
                fluid
                selection
                search
                placeholder={t('common.selectBoard')}
                options={boardOptions}
                value={selectedBoardId}
                onChange={handleBoardChange}
                className={styles.dropdown}
              />
            </div>
          )}

          {selectedBoardId && (
            <div className={styles.dropdownGroup}>
              {!selectedBoardInfo?.isFetched ? (
                <div className={styles.loading}>
                  <Loader active inline size="small" />
                  <span>{t('common.loadingLists', { defaultValue: 'Loading lists...' })}</span>
                </div>
              ) : (
                <Dropdown
                  fluid
                  selection
                  search
                  placeholder={t('common.selectList', { defaultValue: 'Select list' })}
                  options={listOptions}
                  value={selectedListId}
                  onChange={handleListChange}
                  className={styles.dropdown}
                />
              )}
            </div>
          )}

          {selectedListId && (
            <Button
              positive
              fluid
              loading={isSubmitting}
              disabled={isSubmitting}
              onClick={handleSync}
              className={styles.syncButton}
            >
              <Icon name="sync" />
              {t('action.sync', { defaultValue: 'Sync' })}
            </Button>
          )}
        </div>
      </Popup.Content>
    </>
  );
});

SyncCardStep.propTypes = {
  cardId: PropTypes.string.isRequired,
  onBack: PropTypes.func,
};

SyncCardStep.defaultProps = {
  onBack: undefined,
};

export default SyncCardStep;
