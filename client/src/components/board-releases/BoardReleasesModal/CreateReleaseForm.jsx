/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */
/* eslint-disable import/no-extraneous-dependencies */

import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import DateObject from 'react-date-object';
import persian from 'react-date-object/calendars/persian';
import persianEn from 'react-date-object/locales/persian_en';
import DatePicker from 'react-datepicker';
import { useTranslation } from 'react-i18next';
import JalaliDatePicker from 'react-multi-date-picker';
import { useSelector } from 'react-redux';
import { Button, Form } from 'semantic-ui-react';

import selectors from '../../../selectors';

import styles from './CreateReleaseForm.module.scss';

const STATUS_OPTIONS = [
  { key: 'planning', value: 'planning', text: 'Planning' },
  { key: 'in_progress', value: 'in_progress', text: 'In Progress' },
  { key: 'testing', value: 'testing', text: 'Testing' },
  { key: 'completed', value: 'completed', text: 'Completed' },
  { key: 'released', value: 'released', text: 'Released' },
  { key: 'cancelled', value: 'cancelled', text: 'Cancelled' },
];

const CreateReleaseForm = React.memo(({ onCreate, onCancel, isSubmitting }) => {
  const { t } = useTranslation();
  const selectBoardById = useMemo(() => selectors.makeSelectBoardById(), []);
  const currentBoard = useSelector(selectors.selectCurrentBoard);
  const board = useSelector((state) =>
    currentBoard ? selectBoardById(state, currentBoard.id) : null,
  );

  const [version, setVersion] = useState('');
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [status, setStatus] = useState('planning');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const isJalali = board?.calendarType === 'jalali';

  const handleStartDateChange = useCallback(
    (date) => {
      if (isJalali && date) {
        // Convert DateObject to JavaScript Date
        setStartDate(date.toDate());
      } else {
        setStartDate(date);
      }
    },
    [isJalali],
  );

  const handleEndDateChange = useCallback(
    (date) => {
      if (isJalali && date) {
        // Convert DateObject to JavaScript Date
        setEndDate(date.toDate());
      } else {
        setEndDate(date);
      }
    },
    [isJalali],
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      if (!version.trim() || !name.trim() || !startDate || !endDate) {
        return;
      }

      onCreate({
        version: version.trim(),
        name: name.trim(),
        target: target.trim() || null,
        status,
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
      });
    },
    [version, name, target, status, startDate, endDate, onCreate],
  );

  const isFormValid = useMemo(() => {
    return version.trim() && name.trim() && startDate && endDate;
  }, [version, name, startDate, endDate]);

  return (
    <Form onSubmit={handleSubmit} className={styles.form}>
      <Form.Input
        label={t('common.version')}
        placeholder="v1.0.0"
        value={version}
        onChange={(e) => setVersion(e.target.value)}
        required
        autoFocus
      />
      <Form.Input
        label={t('common.name')}
        placeholder="Release name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Form.TextArea
        label={t('common.target')}
        placeholder="Target or goal for this release"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        rows={2}
      />
      <Form.Select
        label={t('common.status')}
        options={STATUS_OPTIONS}
        value={status}
        onChange={(e, { value }) => setStatus(value)}
      />
      <Form.Group widths="equal">
        <Form.Field required>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label>{t('common.startDate')}</label>
          {isJalali ? (
            <JalaliDatePicker
              value={startDate ? new DateObject(startDate).convert(persian, persianEn) : null}
              onChange={handleStartDateChange}
              calendar={persian}
              locale={persianEn}
              format="YYYY/MM/DD"
              placeholder="1404/08/22"
              style={{
                width: '100%',
                height: '38px',
                padding: '9px 14px',
                fontSize: '14px',
                lineHeight: '1.21428571em',
                color: 'rgba(0,0,0,.87)',
                border: '1px solid rgba(34,36,38,.15)',
                borderRadius: '.28571429rem',
                fontFamily: 'Lato, "Helvetica Neue", Arial, Helvetica, sans-serif',
              }}
              containerStyle={{
                width: '100%',
              }}
            />
          ) : (
            <DatePicker
              selected={startDate}
              onChange={handleStartDateChange}
              dateFormat="MMM d, yyyy"
              placeholderText={t('common.selectDate')}
              isClearable
              className={styles.datePicker}
              wrapperClassName={styles.datePicker}
            />
          )}
        </Form.Field>
        <Form.Field required>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label>{t('common.endDate')}</label>
          {isJalali ? (
            <JalaliDatePicker
              value={endDate ? new DateObject(endDate).convert(persian, persianEn) : null}
              onChange={handleEndDateChange}
              calendar={persian}
              locale={persianEn}
              format="YYYY/MM/DD"
              placeholder="1404/08/22"
              style={{
                width: '100%',
                height: '38px',
                padding: '9px 14px',
                fontSize: '14px',
                lineHeight: '1.21428571em',
                color: 'rgba(0,0,0,.87)',
                border: '1px solid rgba(34,36,38,.15)',
                borderRadius: '.28571429rem',
                fontFamily: 'Lato, "Helvetica Neue", Arial, Helvetica, sans-serif',
              }}
              containerStyle={{
                width: '100%',
              }}
            />
          ) : (
            <DatePicker
              selected={endDate}
              onChange={handleEndDateChange}
              dateFormat="MMM d, yyyy"
              placeholderText={t('common.selectDate')}
              isClearable
              minDate={startDate}
              className={styles.datePicker}
              wrapperClassName={styles.datePicker}
            />
          )}
        </Form.Field>
      </Form.Group>
      <Form.Group>
        <Button
          type="submit"
          primary
          loading={isSubmitting}
          disabled={isSubmitting || !isFormValid}
        >
          {t('action.create')}
        </Button>
        <Button type="button" onClick={onCancel} disabled={isSubmitting}>
          {t('action.cancel')}
        </Button>
      </Form.Group>
    </Form>
  );
});

CreateReleaseForm.propTypes = {
  onCreate: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

CreateReleaseForm.defaultProps = {
  isSubmitting: false,
};

export default CreateReleaseForm;
