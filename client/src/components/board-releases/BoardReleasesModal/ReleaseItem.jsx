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
import { Button, Confirm, Dropdown, Icon } from 'semantic-ui-react';

import selectors from '../../../selectors';

import styles from './ReleaseItem.module.scss';

const STATUS_CONFIG = {
  planning: { color: 'grey', text: 'Planning', icon: 'calendar outline' },
  in_progress: { color: 'blue', text: 'In Progress', icon: 'hourglass half' },
  testing: { color: 'yellow', text: 'Testing', icon: 'lab' },
  completed: { color: 'green', text: 'Completed', icon: 'check circle' },
  released: { color: 'teal', text: 'Released', icon: 'flag checkered' },
  cancelled: { color: 'red', text: 'Cancelled', icon: 'ban' },
};

const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([key, config]) => ({
  key,
  value: key,
  text: config.text,
  icon: config.icon,
}));

const ReleaseItem = React.memo(
  ({ release, onUpdate, onUpdateStatus, onDelete, onClick, onViewSnapshot }) => {
    const { t } = useTranslation();
    const selectBoardById = useMemo(() => selectors.makeSelectBoardById(), []);
    const currentBoard = useSelector(selectors.selectCurrentBoard);
    const board = useSelector((state) =>
      currentBoard ? selectBoardById(state, currentBoard.id) : null,
    );
    const cardCounts = useSelector(selectors.selectReleaseCardCounts);
    const cardCount = cardCounts[release.id] || 0;

    const [isEditing, setIsEditing] = useState(false);
    const [version, setVersion] = useState(release.version);
    const [name, setName] = useState(release.name);
    const [target, setTarget] = useState(release.target || '');
    const [status, setStatus] = useState(release.status);
    const [startDate, setStartDate] = useState(
      release.startDate ? new Date(release.startDate) : null,
    );
    const [endDate, setEndDate] = useState(release.endDate ? new Date(release.endDate) : null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const isJalali = board?.calendarType === 'jalali';

    const formatDate = useCallback(
      (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);

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

    const statusConfig = STATUS_CONFIG[release.status] || STATUS_CONFIG.planning;

    const handleEdit = useCallback(() => {
      setIsEditing(true);
    }, []);

    const handleStartDateChange = useCallback(
      (date) => {
        if (isJalali && date) {
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
          setEndDate(date.toDate());
        } else {
          setEndDate(date);
        }
      },
      [isJalali],
    );

    const handleSave = useCallback(() => {
      if (version.trim() && name.trim()) {
        onUpdate(release.id, {
          version: version.trim(),
          name: name.trim(),
          target: target.trim() || null,
          status,
          startDate: startDate ? startDate.toISOString() : null,
          endDate: endDate ? endDate.toISOString() : null,
        });
        setIsEditing(false);
      }
    }, [release.id, version, name, target, status, startDate, endDate, onUpdate]);

    const handleCancel = useCallback(() => {
      setVersion(release.version);
      setName(release.name);
      setTarget(release.target || '');
      setStatus(release.status);
      setStartDate(release.startDate ? new Date(release.startDate) : null);
      setEndDate(release.endDate ? new Date(release.endDate) : null);
      setIsEditing(false);
    }, [release]);

    const handleStatusChange = useCallback(
      (e, { value }) => {
        onUpdateStatus(release.id, value);
      },
      [release.id, onUpdateStatus],
    );

    const handleDelete = useCallback(() => {
      setShowDeleteConfirm(true);
    }, []);

    const handleDeleteConfirm = useCallback(() => {
      onDelete(release.id);
      setShowDeleteConfirm(false);
    }, [release.id, onDelete]);

    if (isEditing) {
      return (
        <div className={styles.releaseRow}>
          <div className={styles.editWrapper}>
            <div className={styles.editField}>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label className={styles.label} htmlFor="version-input">
                Version
              </label>
              <input
                id="version-input"
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v1.0.0"
                className={styles.input}
              />
            </div>
            <div className={styles.editField}>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label className={styles.label}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Release name"
                className={styles.input}
              />
            </div>
            <div className={styles.editField}>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label className={styles.label}>Target</label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Target"
                className={styles.input}
              />
            </div>
            <div className={styles.editField}>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label className={styles.label}>Start Date</label>
              {isJalali ? (
                <JalaliDatePicker
                  value={startDate ? new DateObject(startDate).convert(persian, persianEn) : null}
                  onChange={handleStartDateChange}
                  calendar={persian}
                  locale={persianEn}
                  format="YYYY/MM/DD"
                  calendarPosition="bottom-center"
                  inputClass={styles.dateInput}
                  placeholder="Start date"
                />
              ) : (
                <DatePicker
                  selected={startDate}
                  onChange={handleStartDateChange}
                  dateFormat="yyyy/MM/dd"
                  placeholderText="Start date"
                  className={styles.dateInput}
                />
              )}
            </div>
            <div className={styles.editField}>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label className={styles.label}>End Date</label>
              {isJalali ? (
                <JalaliDatePicker
                  value={endDate ? new DateObject(endDate).convert(persian, persianEn) : null}
                  onChange={handleEndDateChange}
                  calendar={persian}
                  locale={persianEn}
                  format="YYYY/MM/DD"
                  calendarPosition="bottom-center"
                  inputClass={styles.dateInput}
                  placeholder="End date"
                />
              ) : (
                <DatePicker
                  selected={endDate}
                  onChange={handleEndDateChange}
                  dateFormat="yyyy/MM/dd"
                  placeholderText="End date"
                  className={styles.dateInput}
                />
              )}
            </div>
            <div className={styles.editField}>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label className={styles.label}>Status</label>
              <Dropdown
                selection
                options={STATUS_OPTIONS}
                value={status}
                onChange={(e, { value }) => setStatus(value)}
                disabled={release.status === 'released'}
                className={styles.statusDropdown}
              />
            </div>
            <div className={styles.editActions}>
              <Button size="small" primary onClick={handleSave}>
                {t('action.save')}
              </Button>
              <Button size="small" onClick={handleCancel}>
                {t('action.cancel')}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className={styles.releaseRow}>
          <div className={styles.nameColumn}>
            <div className={styles.name}>
              <Icon name="tag" className={styles.icon} />
              <span className={styles.version}>{release.version}</span>
              <span className={styles.separator}>·</span>
              <span>{release.name}</span>
            </div>
          </div>

          <div className={styles.targetColumn}>
            {release.target && <span className={styles.targetText}>{release.target}</span>}
          </div>

          <div className={styles.dateColumn}>
            {release.startDate && (
              <div className={styles.dateInfo}>
                <Icon name="calendar outline" className={styles.icon} />
                <span>{formatDate(release.startDate)}</span>
              </div>
            )}
          </div>

          <div className={styles.dateColumn}>
            {release.endDate && (
              <div className={styles.dateInfo}>
                <Icon name="calendar check outline" className={styles.icon} />
                <span>{formatDate(release.endDate)}</span>
              </div>
            )}
          </div>

          <div className={styles.statusColumn}>
            <Dropdown
              value={release.status}
              options={STATUS_OPTIONS}
              onChange={handleStatusChange}
              disabled={release.status === 'released'}
              trigger={
                <div className={styles.statusBadge}>
                  <Icon name={statusConfig.icon} />
                  {statusConfig.text}
                </div>
              }
            />
          </div>

          <div
            className={styles.cardsColumn}
            onClick={() => onClick(release)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && onClick(release)}
          >
            <Icon name="clone outline" />
            <span>{cardCount}</span>
          </div>

          <div className={styles.actionsColumn}>
            {release.status === 'released' && release.boardVersionId && (
              <Button size="mini" icon basic onClick={() => onViewSnapshot(release.id)}>
                <Icon name="eye" />
              </Button>
            )}
            <Button
              size="mini"
              icon
              basic
              onClick={handleEdit}
              disabled={release.status === 'released'}
            >
              <Icon name="edit" />
            </Button>
            <Button
              size="mini"
              icon
              basic
              onClick={handleDelete}
              disabled={release.status === 'released'}
            >
              <Icon name="trash" />
            </Button>
          </div>
        </div>

        <Confirm
          open={showDeleteConfirm}
          header={t('common.deleteRelease', { defaultValue: 'Delete Release' })}
          content={t('common.areYouSureYouWantToDeleteThisRelease', {
            defaultValue:
              'Are you sure you want to delete this release? This action cannot be undone.',
          })}
          confirmButton={t('action.delete', { defaultValue: 'Delete' })}
          cancelButton={t('action.cancel', { defaultValue: 'Cancel' })}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </>
    );
  },
);

ReleaseItem.propTypes = {
  release: PropTypes.shape({
    id: PropTypes.string.isRequired,
    version: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    target: PropTypes.string,
    status: PropTypes.string.isRequired,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    releasedAt: PropTypes.string,
    boardVersionId: PropTypes.string,
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onUpdateStatus: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  onViewSnapshot: PropTypes.func.isRequired,
};

export default ReleaseItem;
