/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Dropdown, Icon, Message, Segment, Statistic, Table, Loader } from 'semantic-ui-react';

import entryActions from '../../../entry-actions';
import selectors from '../../../selectors';
import { useClosableModal } from '../../../hooks';
import api from '../../../api';

import styles from './UserCardStatsModal.module.scss';

const UserCardStatsModal = React.memo(() => {
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const modal = useSelector(selectors.selectCurrentModal);
  const currentUser = useSelector(selectors.selectCurrentUser);
  const accessToken = useSelector(selectors.selectAccessToken);
  const userId = modal?.params?.userId || currentUser?.id;

  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
        const { cards: responseCards } = await api.getUserCardStats(headers);
        if (isMounted && responseCards) {
          setCards(responseCards);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (userId && accessToken) {
      fetchStats();
    }

    return () => {
      isMounted = false;
    };
  }, [userId, accessToken]);

  const boards = useMemo(() => {
    const map = new Map();
    cards.forEach((card) => {
      if (card.boardId) {
        map.set(card.boardId, {
          id: card.boardId,
          name: card.boardName || t('common.unknown'),
          projectId: card.projectId || null,
        });
      }
    });
    return Array.from(map.values());
  }, [cards, t]);

  const projects = useMemo(() => {
    const map = new Map();
    cards.forEach((card) => {
      if (card.projectId) {
        map.set(card.projectId, {
          id: card.projectId,
          name: card.projectName || t('common.unknown'),
        });
      }
    });
    return Array.from(map.values());
  }, [cards, t]);

  const filteredCards = useMemo(() => {
    let result = cards;

    if (selectedProjectId) {
      result = result.filter((card) => card.projectId === selectedProjectId);
    }

    if (selectedBoardId) {
      result = result.filter((card) => card.boardId === selectedBoardId);
    }

    return result;
  }, [cards, selectedBoardId, selectedProjectId]);

  const totals = useMemo(() => {
    const now = Date.now();

    return filteredCards.reduce(
      (acc, card) => {
        const listName = card.listName ? card.listName.toLowerCase() : '';
        const isDone = listName === 'done';
        const due = card.dueDate ? new Date(card.dueDate).getTime() : null;
        const isDelayed = due && !isDone && card.isClosed === false && due < now;

        acc.total += 1;
        if (isDone) {
          acc.done += 1;
        }
        if (isDelayed) {
          acc.delayed += 1;
        }

        return acc;
      },
      { total: 0, done: 0, delayed: 0 },
    );
  }, [filteredCards]);

  const perBoard = useMemo(() => {
    const now = Date.now();
    const map = new Map();

    filteredCards.forEach((card) => {
      const { boardId, boardName, listName: rawListName, dueDate, isClosed, projectName } = card;
      const listName = rawListName ? rawListName.toLowerCase() : '';
      const isDone = listName === 'done';
      const due = dueDate ? new Date(dueDate).getTime() : null;
      const isDelayed = due && !isDone && isClosed === false && due < now;

      if (!map.has(boardId)) {
        map.set(boardId, {
          id: boardId,
          name: boardName,
          projectName,
          total: 0,
          done: 0,
          delayed: 0,
        });
      }

      const stats = map.get(boardId);
      stats.total += 1;
      if (isDone) {
        stats.done += 1;
      }
      if (isDelayed) {
        stats.delayed += 1;
      }
    });

    return Array.from(map.values());
  }, [filteredCards]);

  const [ClosableModal] = useClosableModal();

  const handleClose = useCallback(() => {
    dispatch(entryActions.closeModal());
  }, [dispatch]);

  const boardOptions = useMemo(
    () => [
      { key: 'all', value: null, text: t('common.allBoards') },
      ...boards
        .filter((board) => !selectedProjectId || board.projectId === selectedProjectId)
        .map((board) => ({
          key: board.id,
          value: board.id,
          text: board.name,
        })),
    ],
    [boards, selectedProjectId, t],
  );

  const projectOptions = useMemo(
    () => [
      { key: 'all', value: null, text: t('common.allProjects') },
      ...projects.map((project) => ({
        key: project.id,
        value: project.id,
        text: project.name,
      })),
    ],
    [projects, t],
  );

  return (
    <ClosableModal closeIcon size="small" onClose={handleClose} className={styles.modal}>
      <ClosableModal.Header>
        {t('common.userCardStatsTitle', {
          context: 'title',
        })}
      </ClosableModal.Header>
      <ClosableModal.Content>
        {isLoading && <Loader active inline="centered" />}
        {!isLoading && error && <Message negative content={t('common.somethingWentWrong')} />}
        {!isLoading && !error && (
          <>
            <div className={styles.filterRow}>
              <div className={styles.filterLabel}>{t('common.filterByProject')}</div>
              <Dropdown
                selection
                clearable
                search
                options={projectOptions}
                value={selectedProjectId}
                onChange={(_, data) => {
                  setSelectedProjectId(data.value || null);
                  setSelectedBoardId(null);
                }}
                placeholder={t('common.selectProjects')}
                className={styles.boardDropdown}
                icon={<Icon name="dropdown" />}
              />
            </div>

            <div className={styles.filterRow}>
              <div className={styles.filterLabel}>{t('common.filterByBoard')}</div>
              <Dropdown
                selection
                clearable
                search
                options={boardOptions}
                value={selectedBoardId}
                onChange={(_, data) => setSelectedBoardId(data.value || null)}
                placeholder={t('common.selectBoards')}
                className={styles.boardDropdown}
                icon={<Icon name="dropdown" />}
                disabled={selectedProjectId ? false : boards.length === 0}
              />
            </div>

            <div className={styles.summaryCards}>
              <Segment className={styles.card} textAlign="center">
                <Statistic>
                  <Statistic.Value>{totals.total}</Statistic.Value>
                  <Statistic.Label>{t('common.assignedTasks')}</Statistic.Label>
                </Statistic>
              </Segment>
              <Segment className={`${styles.card} ${styles.accentGreen}`} textAlign="center">
                <Statistic color="green">
                  <Statistic.Value>{totals.done}</Statistic.Value>
                  <Statistic.Label>{t('common.doneTasks')}</Statistic.Label>
                </Statistic>
              </Segment>
              <Segment className={`${styles.card} ${styles.accentRed}`} textAlign="center">
                <Statistic color="red">
                  <Statistic.Value>{totals.delayed}</Statistic.Value>
                  <Statistic.Label>{t('common.delayedTasks')}</Statistic.Label>
                </Statistic>
              </Segment>
            </div>

            {perBoard.length === 0 ? (
              <Message info content={t('common.noCardsForSelection')} />
            ) : (
              <Table celled striped compact="very" className={styles.table}>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>{t('common.projectProfiles_project_title')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('common.board')}</Table.HeaderCell>
                    <Table.HeaderCell textAlign="right">{t('common.total')}</Table.HeaderCell>
                    <Table.HeaderCell textAlign="right">{t('common.done')}</Table.HeaderCell>
                    <Table.HeaderCell textAlign="right">{t('common.delayed')}</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {perBoard.map((board) => (
                    <Table.Row key={board.id}>
                      <Table.Cell>{board.projectName || t('common.unknown')}</Table.Cell>
                      <Table.Cell>
                        <div className={styles.boardCell}>
                          <Icon name="columns" />
                          <span>{board.name}</span>
                        </div>
                      </Table.Cell>
                      <Table.Cell textAlign="right">{board.total}</Table.Cell>
                      <Table.Cell textAlign="right">{board.done}</Table.Cell>
                      <Table.Cell textAlign="right" negative={board.delayed > 0}>
                        {board.delayed}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}
          </>
        )}
      </ClosableModal.Content>
    </ClosableModal>
  );
});

export default UserCardStatsModal;
