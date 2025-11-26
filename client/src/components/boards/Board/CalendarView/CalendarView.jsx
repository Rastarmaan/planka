/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */
/* eslint-disable import/no-extraneous-dependencies */

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import DateObject from 'react-date-object';
import persian from 'react-date-object/calendars/persian';
import persianEn from 'react-date-object/locales/persian_en';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createSelector } from 'redux-orm';
import { Dropdown, Popup, Button } from 'semantic-ui-react';

import Paths from '../../../../constants/Paths';
import entryActions from '../../../../entry-actions';
import orm from '../../../../orm';
import selectors from '../../../../selectors';

import styles from './CalendarView.module.scss';

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

const CalendarView = React.memo(() => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [t] = useTranslation();
  const calendarRef = useRef(null);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [currentTitle, setCurrentTitle] = useState('');

  const board = useSelector(selectors.selectCurrentBoard);
  const availableBoards = useSelector(selectors.selectAllAvailableBoards);
  const [selectedBoardIds, setSelectedBoardIds] = useState(() => {
    return board?.id ? [board.id] : [];
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

  const cardsData = useSelector((state) => {
    if (selectedBoardIds.length > 0) {
      return selectCardsForMultipleBoards(state, selectedBoardIds);
    }
    return [];
  });

  const formatDateForJalali = useCallback(
    (date) => {
      if (!isJalali) return null;
      const dateObj = new DateObject({
        date,
        calendar: persian,
        locale: persianEn,
      });
      return dateObj.format('YYYY/MM/DD');
    },
    [isJalali],
  );

  const events = useMemo(() => {
    return cardsData
      .map((card) => {
        const startDate = parseDate(card.startDate);
        const endDate = parseDate(card.dueDate);

        if (!startDate && !endDate) return null;

        const eventStart = startDate || endDate;
        const eventEnd = endDate || startDate;

        // Adjust end date to be inclusive (add 1 day for all-day events)
        const adjustedEnd = new Date(eventEnd);
        adjustedEnd.setDate(adjustedEnd.getDate() + 1);

        const barColor = card.labels[0]?.color || '#4285f4';

        return {
          id: card.id,
          title: card.name,
          start: eventStart,
          end: adjustedEnd,
          allDay: true,
          backgroundColor: barColor,
          borderColor: barColor,
          textColor: '#fff',
          extendedProps: {
            boardName: card.boardName,
            listName: card.listName,
            isDueCompleted: card.isDueCompleted,
            type: card.type,
            originalStart: startDate,
            originalEnd: endDate,
          },
        };
      })
      .filter(Boolean);
  }, [cardsData]);

  const handleEventClick = useCallback(
    (info) => {
      navigate(Paths.CARDS.replace(':id', info.event.id));
    },
    [navigate],
  );

  const handleBoardSelectionChange = useCallback((e, { value }) => {
    setSelectedBoardIds(value);
  }, []);

  const boardOptions = availableBoards.map((b) => ({
    key: b.id,
    text: `${b.projectName} - ${b.name}`,
    value: b.id,
  }));

  const handlePrev = useCallback(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.prev();
      setCurrentTitle(calendarApi.view.title);
    }
  }, []);

  const handleNext = useCallback(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.next();
      setCurrentTitle(calendarApi.view.title);
    }
  }, []);

  const handleToday = useCallback(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.today();
      setCurrentTitle(calendarApi.view.title);
    }
  }, []);

  const handleViewChange = useCallback((view) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(view);
      setCurrentView(view);
      setCurrentTitle(calendarApi.view.title);
    }
  }, []);

  const handleDatesSet = useCallback((dateInfo) => {
    setCurrentTitle(dateInfo.view.title);
    setCurrentView(dateInfo.view.type);
  }, []);

  const renderEventContent = useCallback(
    (eventInfo) => {
      const { event } = eventInfo;
      const { extendedProps } = event;

      return (
        <Popup
          trigger={
            <div className={styles.eventContent}>
              <div className={styles.eventTitle}>{event.title}</div>
            </div>
          }
          content={
            <div className={styles.eventPopup}>
              <div className={styles.eventPopupTitle}>{event.title}</div>
              <div className={styles.eventPopupMeta}>
                <span className={styles.eventPopupBoard}>{extendedProps.boardName}</span>
                <span className={styles.eventPopupList}>{extendedProps.listName}</span>
              </div>
              {extendedProps.originalStart && (
                <div className={styles.eventPopupDate}>
                  {t('common.startDate')}:{' '}
                  {isJalali
                    ? formatDateForJalali(extendedProps.originalStart)
                    : extendedProps.originalStart.toLocaleDateString()}
                </div>
              )}
              {extendedProps.originalEnd && (
                <div className={styles.eventPopupDate}>
                  {t('common.dueDate')}:{' '}
                  {isJalali
                    ? formatDateForJalali(extendedProps.originalEnd)
                    : extendedProps.originalEnd.toLocaleDateString()}
                </div>
              )}
              {extendedProps.isDueCompleted && (
                <div className={styles.eventPopupCompleted}>{t('common.completed')}</div>
              )}
            </div>
          }
          position="top center"
          size="small"
        />
      );
    },
    [t, isJalali, formatDateForJalali],
  );

  const renderCustomHeader = () => (
    <div className={styles.customHeader}>
      <div className={styles.headerLeft}>
        <Dropdown
          placeholder={t('common.selectBoards')}
          multiple
          search
          selection
          options={boardOptions}
          value={selectedBoardIds}
          onChange={handleBoardSelectionChange}
          className={styles.boardDropdown}
        />
        <Button.Group size="small">
          <Button icon="chevron left" onClick={handlePrev} basic />
          <Button icon="chevron right" onClick={handleNext} basic />
        </Button.Group>
        <Button size="small" onClick={handleToday} basic className={styles.todayButton}>
          {isJalali ? 'امروز' : t('common.today')}
        </Button>
      </div>
      <div className={styles.headerCenter}>
        <span className={styles.headerTitle}>{currentTitle}</span>
      </div>
      <div className={styles.headerRight}>
        <Button.Group size="small">
          <Button
            onClick={() => handleViewChange('dayGridMonth')}
            active={currentView === 'dayGridMonth'}
            basic={currentView !== 'dayGridMonth'}
          >
            {isJalali ? 'ماه' : t('common.month')}
          </Button>
          <Button
            onClick={() => handleViewChange('timeGridWeek')}
            active={currentView === 'timeGridWeek'}
            basic={currentView !== 'timeGridWeek'}
          >
            {isJalali ? 'هفته' : t('common.week')}
          </Button>
          <Button
            onClick={() => handleViewChange('timeGridDay')}
            active={currentView === 'timeGridDay'}
            basic={currentView !== 'timeGridDay'}
          >
            {isJalali ? 'روز' : t('common.day')}
          </Button>
        </Button.Group>
      </div>
    </div>
  );

  if (events.length === 0) {
    return (
      <div className={styles.wrapper}>
        {renderCustomHeader()}
        <div className={styles.emptyState}>
          <div className={styles.emptyStateContent}>
            <h3>{t('common.noCardsWithDates')}</h3>
            <p>{t('common.addStartOrDueDateToCardsToSeeCalendar')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {renderCustomHeader()}
      <div className={styles.calendarContainer}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={handleEventClick}
          editable={false}
          droppable={false}
          headerToolbar={false}
          datesSet={handleDatesSet}
          locale={isJalali ? 'fa' : t('common.locale')}
          direction={isJalali ? 'rtl' : 'ltr'}
          height="100%"
          eventContent={renderEventContent}
          dayMaxEvents={4}
          moreLinkClick="popover"
          eventDisplay="block"
          displayEventTime={false}
        />
      </div>
    </div>
  );
});

CalendarView.propTypes = {};

export default CalendarView;
