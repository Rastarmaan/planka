/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */
/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo } from 'react';
import DateObject from 'react-date-object';
import persian from 'react-date-object/calendars/persian';
import persianEn from 'react-date-object/locales/persian_en';
import DatePicker from 'react-datepicker';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'react-multi-date-picker';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Form } from 'semantic-ui-react';
import { Input, Popup } from '../../../lib/custom-ui';
import { useDidUpdate, useToggle } from '../../../lib/hooks';

import entryActions from '../../../entry-actions';
import { useForm, useNestedRef } from '../../../hooks';
import selectors from '../../../selectors';
import parseTime from '../../../utils/parse-time';

import styles from './EditDueDateStep.module.scss';

const EditDueDateStep = React.memo(({ cardId, onBack, onClose }) => {
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);
  const selectBoardById = useMemo(() => selectors.makeSelectBoardById(), []);

  const card = useSelector((state) => selectCardById(state, cardId));
  const board = useSelector((state) => selectBoardById(state, card.boardId));
  const defaultValue = card.dueDate;

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const isJalali = board?.calendarType === 'jalali';

  const formatDateForDisplay = useCallback(
    (date) => {
      if (isJalali) {
        const dateObj = new DateObject({
          date,
          calendar: persian,
          locale: persianEn,
        });
        return dateObj.format('YYYY/MM/DD');
      }
      return t('format:date', {
        postProcess: 'formatDate',
        value: date,
      });
    },
    [isJalali, t],
  );

  const parseDateFromInput = useCallback(
    (dateString) => {
      if (isJalali) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          const dateObj = new DateObject({
            year: parseInt(parts[0], 10),
            month: parseInt(parts[1], 10),
            day: parseInt(parts[2], 10),
            calendar: persian,
            locale: persianEn,
          });
          return dateObj.toDate();
        }
        return new Date(NaN);
      }
      return t('format:date', {
        postProcess: 'parseDate',
        value: dateString,
      });
    },
    [isJalali, t],
  );

  const [data, handleFieldChange, setData] = useForm(() => {
    const date = defaultValue || new Date().setHours(12, 0, 0, 0);

    return {
      date: formatDateForDisplay(date),
      time: t('format:time', {
        postProcess: 'formatDate',
        value: date,
      }),
    };
  });

  const [selectTimeFieldState, selectTimeField] = useToggle();

  const [dateFieldRef, handleDateFieldRef] = useNestedRef('inputRef');
  const [timeFieldRef, handleTimeFieldRef] = useNestedRef('inputRef');

  const nullableDate = useMemo(() => {
    const date = parseDateFromInput(data.date);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  }, [data.date, parseDateFromInput]);

  const handleSubmit = useCallback(() => {
    if (!nullableDate) {
      dateFieldRef.current.select();
      return;
    }

    let value;
    if (isJalali) {
      value = parseTime(data.time, nullableDate);
    } else {
      value = t('format:dateTime', {
        postProcess: 'parseDate',
        value: `${data.date} ${data.time}`,
      });

      if (Number.isNaN(value.getTime())) {
        value = parseTime(data.time, nullableDate);
      }
    }

    if (Number.isNaN(value.getTime())) {
      timeFieldRef.current.select();
      return;
    }

    if (!defaultValue || value.getTime() !== defaultValue.getTime()) {
      dispatch(
        entryActions.updateCard(cardId, {
          dueDate: value,
        }),
      );
    }

    onClose();
  }, [
    cardId,
    onClose,
    defaultValue,
    dispatch,
    t,
    data,
    dateFieldRef,
    timeFieldRef,
    nullableDate,
    isJalali,
  ]);

  const handleClearClick = useCallback(() => {
    if (defaultValue) {
      dispatch(
        entryActions.updateCard(cardId, {
          dueDate: null,
        }),
      );
    }

    onClose();
  }, [cardId, onClose, defaultValue, dispatch]);

  const handleDatePickerChange = useCallback(
    (date) => {
      const jsDate = date?.toDate ? date.toDate() : date;

      setData((prevData) => ({
        ...prevData,
        date: formatDateForDisplay(jsDate),
      }));
      selectTimeField();
    },
    [formatDateForDisplay, setData, selectTimeField],
  );

  useEffect(() => {
    dateFieldRef.current.select();
  }, [dateFieldRef]);

  useDidUpdate(() => {
    timeFieldRef.current.select();
  }, [selectTimeFieldState]);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.editDueDate', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.fieldWrapper}>
            <div className={styles.fieldBox}>
              <div className={styles.text}>{t('common.date')}</div>
              <Input
                ref={handleDateFieldRef}
                name="date"
                value={data.date}
                maxLength={16}
                onChange={handleFieldChange}
              />
            </div>
            <div className={styles.fieldBox}>
              <div className={styles.text}>{t('common.time')}</div>
              <Input
                ref={handleTimeFieldRef}
                name="time"
                value={data.time}
                maxLength={16}
                onChange={handleFieldChange}
              />
            </div>
          </div>
          {board?.calendarType === 'jalali' ? (
            <Calendar
              inline
              calendar={persian}
              locale={persianEn}
              value={nullableDate}
              onChange={handleDatePickerChange}
              format="YYYY/MM/DD"
              shadow={false}
              mapDays={({ date }) => {
                const isToday =
                  date.format('YYYY/MM/DD') ===
                  new DateObject({ calendar: persian }).format('YYYY/MM/DD');
                return {
                  className: isToday ? 'rmdp-today' : '',
                };
              }}
            />
          ) : (
            <DatePicker
              inline
              disabledKeyboardNavigation
              selected={nullableDate}
              onChange={handleDatePickerChange}
            />
          )}
          <Button positive content={t('action.save')} />
        </Form>
        <Button
          negative
          content={t('action.remove')}
          className={styles.deleteButton}
          onClick={handleClearClick}
        />
      </Popup.Content>
    </>
  );
});

EditDueDateStep.propTypes = {
  cardId: PropTypes.string.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

EditDueDateStep.defaultProps = {
  onBack: undefined,
};

export default EditDueDateStep;
