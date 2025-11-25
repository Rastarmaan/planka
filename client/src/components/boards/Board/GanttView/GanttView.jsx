/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */
/* eslint-disable import/no-extraneous-dependencies */

import { Gantt, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import DateObject from 'react-date-object';
import persian from 'react-date-object/calendars/persian';
import persianEn from 'react-date-object/locales/persian_en';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'redux-orm';
import { Dropdown } from 'semantic-ui-react';

import { BoardMembershipRoles, UserRoles } from '../../../../constants/Enums';
import entryActions from '../../../../entry-actions';
import orm from '../../../../orm';
import selectors from '../../../../selectors';

import styles from './GanttView.module.scss';

const VIEW_MODE_OPTIONS = [
  { key: 'day', text: 'Day', value: ViewMode.Day },
  { key: 'week', text: 'Week', value: ViewMode.Week },
  { key: 'month', text: 'Month', value: ViewMode.Month },
];

function TooltipContent({ task, t, formatDate }) {
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTitle}>{task.name}</div>
      <div className={styles.tooltipDates}>
        {formatDate(task.start)} - {formatDate(task.end)}
      </div>
      {task.project && <div className={styles.tooltipList}>{task.project}</div>}
      {task.progress > 0 && (
        <div className={styles.tooltipProgress}>
          {t('common.progress')}: {task.progress}%
        </div>
      )}
    </div>
  );
}

TooltipContent.propTypes = {
  task: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  t: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
};

function TaskListHeaderDefault({ headerHeight, showBoardColumns }) {
  return (
    <div
      className={styles.ganttTableHeader}
      style={{
        height: headerHeight - 2,
      }}
    >
      <div className={styles.ganttTableHeaderItem} style={{ minWidth: 100 }}>
        Board
      </div>
      <div className={styles.ganttTableHeaderItem} style={{ minWidth: 100 }}>
        List
      </div>
      <div
        className={styles.ganttTableHeaderItem}
        style={{ minWidth: showBoardColumns ? 180 : 220 }}
      >
        Task
      </div>
      <div className={styles.ganttTableHeaderItem} style={{ minWidth: 100 }}>
        From
      </div>
      <div className={styles.ganttTableHeaderItem} style={{ minWidth: 100 }}>
        To
      </div>
    </div>
  );
}

TaskListHeaderDefault.propTypes = {
  headerHeight: PropTypes.number.isRequired,
  showBoardColumns: PropTypes.bool.isRequired,
};

function formatDateLong(date, isJalali) {
  if (!date) return '';

  if (isJalali) {
    const dateObj = new DateObject({
      date,
      calendar: persian,
      locale: persianEn,
    });
    return dateObj.format('dddd, D MMMM YYYY');
  }

  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString(undefined, options);
}

function TaskListTableDefault({ rowHeight, tasks, formatDate, showBoardColumns, isJalali }) {
  const groupedTasks = React.useMemo(() => {
    const boardGroups = {};

    tasks.forEach((task) => {
      const boardName = task.boardName || '-';
      const listName = task.listName || '-';

      if (!boardGroups[boardName]) {
        boardGroups[boardName] = {};
      }

      if (!boardGroups[boardName][listName]) {
        boardGroups[boardName][listName] = [];
      }

      boardGroups[boardName][listName].push(task);
    });

    return boardGroups;
  }, [tasks]);

  return (
    <div className={styles.ganttTableBody}>
      {Object.entries(groupedTasks).map(([boardName, lists]) => {
        const boardTaskCount = Object.values(lists).reduce(
          (sum, listTasks) => sum + listTasks.length,
          0,
        );

        return (
          <div key={`board-${boardName}`} className={styles.ganttTableBoardGroup}>
            <div
              className={styles.ganttTableCellMerged}
              style={{
                minWidth: 100,
                maxWidth: 100,
                height: `${rowHeight * boardTaskCount}px`,
              }}
              title={boardName}
            >
              <div className={styles.ganttTableCellText}>{boardName}</div>
            </div>
            <div className={styles.ganttTableListsGroup}>
              {Object.entries(lists).map(([listName, listTasks]) => (
                <div key={`list-${boardName}-${listName}`} className={styles.ganttTableListGroup}>
                  <div
                    className={styles.ganttTableCellMerged}
                    style={{
                      minWidth: 100,
                      maxWidth: 100,
                      height: `${rowHeight * listTasks.length}px`,
                    }}
                    title={listName}
                  >
                    <div className={styles.ganttTableCellText}>{listName}</div>
                  </div>
                  <div className={styles.ganttTableGroupContent}>
                    {listTasks.map((task) => (
                      <div
                        key={task.id}
                        className={styles.ganttTableRow}
                        style={{
                          height: rowHeight,
                        }}
                      >
                        <div
                          className={styles.ganttTableCell}
                          style={{
                            minWidth: showBoardColumns ? 180 : 220,
                            maxWidth: showBoardColumns ? 180 : 220,
                          }}
                          title={task.name}
                        >
                          <div className={styles.ganttTableCellText}>{task.name}</div>
                        </div>
                        <div
                          className={styles.ganttTableCell}
                          style={{ minWidth: 100, maxWidth: 100 }}
                          title={formatDateLong(task.start, isJalali)}
                        >
                          <div className={styles.ganttTableCellText}>{formatDate(task.start)}</div>
                        </div>
                        <div
                          className={styles.ganttTableCell}
                          style={{ minWidth: 100, maxWidth: 100 }}
                          title={formatDateLong(task.end, isJalali)}
                        >
                          <div className={styles.ganttTableCellText}>{formatDate(task.end)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

TaskListTableDefault.propTypes = {
  rowHeight: PropTypes.number.isRequired,
  tasks: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  formatDate: PropTypes.func.isRequired,
  showBoardColumns: PropTypes.bool.isRequired,
  isJalali: PropTypes.bool.isRequired,
};

TaskListTableDefault.defaultProps = {};

function getColumnWidth(mode, isJalali) {
  if (mode === ViewMode.Month) return 300;
  if (mode === ViewMode.Week) return 250;
  if (mode === ViewMode.Day && isJalali) return 100;
  return 60;
}

function parseDate(dateString) {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }

    const parts = dateString.split(/[\s/]+/);
    if (parts.length >= 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);

      let hour = 0;
      let minute = 0;

      if (parts.length >= 4) {
        const timeParts = parts[3].split(':');
        hour = parseInt(timeParts[0], 10) || 0;
        minute = parseInt(timeParts[1], 10) || 0;
      }

      const parsedDate = new Date(year, month, day, hour, minute);

      if (!Number.isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error parsing date:', dateString, error);
  }

  return null;
}

const makeSelectCardsForMultipleBoards = () =>
  createSelector(
    orm,
    (_, boardIds) => boardIds,
    ({ Board }, boardIds) => {
      const result = [];

      if (!boardIds || boardIds.length === 0) {
        return result;
      }

      boardIds.forEach((boardId) => {
        const boardModel = Board.withId(boardId);
        if (!boardModel) return;

        boardModel.lists.toModelArray().forEach((listModel) => {
          listModel.cards.toModelArray().forEach((cardModel) => {
            const card = cardModel.ref;
            const list = listModel.ref;
            const board = boardModel.ref;
            const labels = cardModel.labels ? cardModel.labels.toRefArray() : [];

            result.push({
              id: card.id,
              name: card.name,
              startDate: card.startDate,
              dueDate: card.dueDate,
              isDueCompleted: card.isDueCompleted,
              parentCardId: card.parentCardId,
              type: card.type,
              listName: list?.name || 'No List',
              boardName: board?.name || 'No Board',
              labels,
            });
          });
        });
      });

      return result;
    },
  );

const selectCardsForMultipleBoards = makeSelectCardsForMultipleBoards();

const GanttView = React.memo(() => {
  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [viewMode, setViewMode] = useState(ViewMode.Week);

  const board = useSelector(selectors.selectCurrentBoard);
  const availableBoards = useSelector(selectors.selectAllAvailableBoards);
  const [selectedBoardIds, setSelectedBoardIds] = useState(() => {
    return board?.id ? [board.id] : [];
  });

  const canEditCard = useSelector((state) => {
    const currentUser = selectors.selectCurrentUser(state);
    const currentProject = selectors.selectCurrentProject(state);
    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);

    const isAdmin = currentUser?.role === UserRoles.ADMIN;
    const isProjectManager =
      currentProject && currentUser && selectors.selectIsCurrentUserManagerForCurrentProject(state);

    return (
      isAdmin ||
      isProjectManager ||
      (!!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR)
    );
  });

  const isJalali = board?.calendarType === 'jalali';

  useEffect(() => {
    if (board?.id && !selectedBoardIds.includes(board.id)) {
      setSelectedBoardIds([board.id]);
    }
  }, [board?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    selectedBoardIds.forEach((boardId) => {
      const boardData = availableBoards.find((b) => b.id === boardId);
      if (boardData && !boardData.isFetched) {
        dispatch(entryActions.fetchBoard(boardId));
      }
    });
  }, [selectedBoardIds, availableBoards, dispatch]);

  const formatDate = useCallback(
    (date) => {
      if (isJalali) {
        const dateObj = new DateObject({
          date,
          calendar: persian,
          locale: persianEn,
        });
        return dateObj.format('YYYY/MM/DD');
      }

      return date.toLocaleDateString();
    },
    [isJalali],
  );

  const cardsData = useSelector((state) => {
    if (selectedBoardIds.length > 0) {
      return selectCardsForMultipleBoards(state, selectedBoardIds);
    }
    return [];
  });

  const GanttTooltip = useCallback(
    ({ task }) => <TooltipContent task={task} t={t} formatDate={formatDate} />,
    [t, formatDate],
  );

  const showBoardColumns = selectedBoardIds.length > 1;

  const listCellWidth = 'calc(140px + 180px + 100px + 100px)';

  const TaskListHeader = useCallback(
    ({ headerHeight }) => (
      <TaskListHeaderDefault headerHeight={headerHeight} showBoardColumns={showBoardColumns} />
    ),
    [showBoardColumns],
  );

  const TaskListTable = useCallback(
    ({ rowHeight, tasks }) => (
      <TaskListTableDefault
        rowHeight={rowHeight}
        tasks={tasks}
        formatDate={formatDate}
        showBoardColumns={showBoardColumns}
        isJalali={isJalali}
      />
    ),
    [formatDate, showBoardColumns, isJalali],
  );

  const tasks = (() => {
    const result = [];
    const processed = new Set();

    const processCard = (card, depth = 0, parentName = null) => {
      if (processed.has(card.id)) return;
      processed.add(card.id);

      const children = cardsData
        .filter((c) => c.parentCardId === card.id)
        .sort((a, b) => {
          const aStart = parseDate(a.startDate);
          const bStart = parseDate(b.startDate);

          if (aStart && bStart) {
            return aStart - bStart;
          }
          if (aStart) return -1;
          if (bStart) return 1;

          return (a.position || 0) - (b.position || 0);
        });

      let cardStart = parseDate(card.startDate);
      let cardEnd = parseDate(card.dueDate);

      if (children.length > 0 && (!cardStart || !cardEnd)) {
        const childDates = children
          .map((child) => {
            const grandchildren = cardsData.filter((c) => c.parentCardId === child.id);
            let childStart = parseDate(child.startDate);
            let childEnd = parseDate(child.dueDate);

            if (grandchildren.length > 0) {
              const grandchildDates = grandchildren
                .map((gc) => ({
                  start: parseDate(gc.startDate),
                  end: parseDate(gc.dueDate),
                }))
                .filter((d) => d.start || d.end);

              if (grandchildDates.length > 0) {
                if (!childStart) {
                  const starts = grandchildDates.map((d) => d.start).filter(Boolean);
                  if (starts.length > 0) {
                    [childStart] = starts.sort((a, b) => a - b);
                  }
                }
                if (!childEnd) {
                  const ends = grandchildDates.map((d) => d.end).filter(Boolean);
                  if (ends.length > 0) {
                    [childEnd] = ends.sort((a, b) => b - a);
                  }
                }
              }
            }

            return { start: childStart, end: childEnd };
          })
          .filter((dates) => dates.start || dates.end);

        if (childDates.length > 0) {
          const childStarts = childDates
            .map((d) => d.start)
            .filter(Boolean)
            .sort((a, b) => a - b);
          if (!cardStart && childStarts.length > 0) {
            [cardStart] = childStarts;
          }

          const childEnds = childDates
            .map((d) => d.end)
            .filter(Boolean)
            .sort((a, b) => b - a);
          if (!cardEnd && childEnds.length > 0) {
            [cardEnd] = childEnds;
          }
        }
      }

      if (cardStart && cardEnd) {
        if (cardEnd <= cardStart) {
          cardEnd = new Date(cardStart);
          cardEnd.setDate(cardEnd.getDate() + 1);
        }

        const barColor = card.labels[0]?.color || '#4285f4';

        let taskType = 'task';
        if (card.type === 'epic') {
          taskType = 'milestone';
        } else if (children.length > 0) {
          taskType = 'project';
        }

        const ganttTask = {
          id: card.id,
          name: card.name,
          boardName: card.boardName,
          listName: card.listName,
          start: cardStart,
          end: cardEnd,
          progress: card.isDueCompleted ? 100 : 0,
          type: taskType,
          dependencies: card.parentCardId ? [card.parentCardId] : [],
          styles: {
            backgroundColor: taskType === 'milestone' ? '#FFD700' : barColor,
            backgroundSelectedColor: taskType === 'milestone' ? '#FFA500' : barColor,
            progressColor: '#1a73e8',
            progressSelectedColor: '#1a73e8',
          },
          isDisabled: !canEditCard,
          project: parentName || card.name,
        };

        if (taskType === 'milestone') {
          ganttTask.start = cardEnd;
          ganttTask.end = cardEnd;
        }

        result.push(ganttTask);
      }

      children.forEach((child) => {
        processCard(child, depth + 1, card.name);
      });
    };

    const rootCards = cardsData
      .filter((card) => !card.parentCardId)
      .sort((a, b) => {
        if (a.type === 'epic' && b.type !== 'epic') return 1;
        if (a.type !== 'epic' && b.type === 'epic') return -1;

        const aStart = parseDate(a.startDate);
        const bStart = parseDate(b.startDate);

        if (aStart && bStart) {
          return aStart - bStart;
        }
        if (aStart) return -1;
        if (bStart) return 1;

        return (a.position || 0) - (b.position || 0);
      });

    rootCards.forEach((card) => processCard(card, 0));

    return result.sort((a, b) => {
      if (a.type === 'milestone' && b.type !== 'milestone') return 1;
      if (a.type !== 'milestone' && b.type === 'milestone') return -1;

      return 0;
    });
  })();

  const handleTaskClick = useCallback(
    (task) => {
      dispatch(entryActions.openCard(task.id));
    },
    [dispatch],
  );

  const handleTaskChange = useCallback(
    (task) => {
      if (!canEditCard) return;

      const updateData = {};

      if (task.start) {
        updateData.startDate = task.start.toISOString();
      }

      if (task.end) {
        updateData.dueDate = task.end.toISOString();
      }

      if (Object.keys(updateData).length > 0) {
        dispatch(entryActions.updateCard(task.id, updateData));
      }
    },
    [dispatch, canEditCard],
  );

  const handleViewModeChange = useCallback((e, { value }) => {
    setViewMode(value);
  }, []);

  const handleBoardSelectionChange = useCallback((e, { value }) => {
    setSelectedBoardIds(value);
  }, []);

  const boardOptions = availableBoards.map((b) => ({
    key: b.id,
    text: `${b.projectName} - ${b.name}`,
    value: b.id,
  }));

  const renderControls = () => (
    <div className={styles.controls}>
      <div className={styles.viewModeSelector}>
        <span className={styles.label}>{t('common.viewMode')}:</span>
        <Dropdown
          selection
          compact
          options={VIEW_MODE_OPTIONS}
          value={viewMode}
          onChange={handleViewModeChange}
        />
      </div>
      <div className={styles.boardSelector}>
        <span className={styles.label}>{t('common.boards')}:</span>
        <Dropdown
          placeholder={t('common.selectBoards')}
          fluid
          multiple
          search
          selection
          options={boardOptions}
          value={selectedBoardIds}
          onChange={handleBoardSelectionChange}
          className={styles.boardDropdown}
        />
      </div>
      {/* <Button
        size="small"
        onClick={() => {
          // TODO: Implement scroll to today functionality
        }}
      >
        {t('action.goToToday')}
      </Button> */}
    </div>
  );

  if (tasks.length === 0) {
    return (
      <div className={styles.wrapper}>
        {renderControls()}
        <div className={styles.emptyState}>
          <div className={styles.emptyStateContent}>
            <h3>{t('common.noCardsWithDates')}</h3>
            <p>{t('common.addStartOrDueDateToCardsToSeeGanttChart')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {renderControls()}
      <div className={styles.ganttContainer}>
        <Gantt
          tasks={tasks}
          viewMode={viewMode}
          onDateChange={handleTaskChange}
          onClick={handleTaskClick}
          columnWidth={getColumnWidth(viewMode, isJalali)}
          listCellWidth={listCellWidth}
          locale={isJalali ? 'fa' : t('common.locale')}
          barCornerRadius={4}
          barFill={60}
          todayColor="rgba(252, 248, 227, 0.5)"
          TooltipContent={GanttTooltip}
          TaskListHeader={TaskListHeader}
          TaskListTable={TaskListTable}
          rowHeight={50}
          headerHeight={50}
          fontSize="14px"
        />
      </div>
    </div>
  );
});

GanttView.propTypes = {};

export default GanttView;
