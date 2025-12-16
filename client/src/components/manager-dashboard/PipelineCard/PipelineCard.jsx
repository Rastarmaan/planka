/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
// eslint-disable-next-line import/no-unresolved
import CardWavesSvg from '../icons/card-waves.svg?url';

import styles from './PipelineCard.module.scss';

const CARD_THEMES = ['teal', 'gray', 'yellow'];

const STATUS_LABELS = {
  todo: 'در انتظار',
  doing: 'در حال انجام',
  done: 'انجام شده',
};

const STATUS_THEME = {
  todo: 'teal',
  doing: 'yellow',
  done: 'gray',
};

const formatDate = (value) => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  try {
    return new Intl.DateTimeFormat('fa-IR').format(date);
  } catch (error) {
    return date.toISOString().slice(0, 10);
  }
};

const membershipShapeDefinition = {
  id: PropTypes.string,
  permission: PropTypes.string,
  phaseId: PropTypes.string,
  user: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    username: PropTypes.string,
    email: PropTypes.string,
  }),
};

export const membershipShape = PropTypes.shape(membershipShapeDefinition);

const PipelineCard = React.memo(({ phase, index }) => {
  if (!phase) {
    return null;
  }

  const statusTheme = STATUS_THEME[phase.status];
  const fallbackTheme = CARD_THEMES[(index - 1) % CARD_THEMES.length];
  const theme = statusTheme || fallbackTheme;

  const primaryMembership = phase.memberships?.[0]?.user;
  const assigneeName =
    primaryMembership?.name || primaryMembership?.username || primaryMembership?.email || '—';

  const statusLabel = STATUS_LABELS[phase.status] || '—';
  const endDateLabel = formatDate(phase.endDate);
  const startDateLabel = formatDate(phase.startDate);
  const description = phase.description || phase.name || 'مرحله بدون توضیح';

  return (
    <div
      className={classNames(
        styles.wrapper,
        styles[`theme${theme.charAt(0).toUpperCase() + theme.slice(1)}`],
      )}
    >
      <div className={styles.backgroundLayer} />

      <div className={styles.cardBody}>
        <img src={CardWavesSvg} alt="" className={styles.waveShape} />
      </div>

      <div className={styles.content}>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{assigneeName}</span>
          <svg
            className={styles.profileIcon}
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1" />
            <circle cx="9" cy="7" r="2.5" stroke="currentColor" strokeWidth="1" />
            <path
              d="M4 15c0-2.5 2.5-4 5-4s5 1.5 5 4"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
            />
          </svg>
        </div>

        <p className={styles.description}>{description}</p>

        <div className={styles.statusBadge}>
          <span>{statusLabel}</span>
        </div>

        <div className={styles.datesRow}>
          <div className={styles.dateBadge}>
            <span>{endDateLabel}</span>
            <svg
              className={styles.calendarIcon}
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="1.5"
                y="2"
                width="11"
                height="10"
                rx="1"
                stroke="currentColor"
                strokeWidth="1"
              />
              <line x1="4" y1="1" x2="4" y2="3" stroke="currentColor" strokeWidth="1" />
              <line x1="10" y1="1" x2="10" y2="3" stroke="currentColor" strokeWidth="1" />
              <line x1="1.5" y1="5" x2="12.5" y2="5" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
          <div className={styles.dateBadge}>
            <span>{startDateLabel}</span>
            <svg
              className={styles.calendarIcon}
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="1.5"
                y="2"
                width="11"
                height="10"
                rx="1"
                stroke="currentColor"
                strokeWidth="1"
              />
              <line x1="4" y1="1" x2="4" y2="3" stroke="currentColor" strokeWidth="1" />
              <line x1="10" y1="1" x2="10" y2="3" stroke="currentColor" strokeWidth="1" />
              <line x1="1.5" y1="5" x2="12.5" y2="5" stroke="currentColor" strokeWidth="1" />
              <path d="M4 8l2 2 4-4" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
          </div>
        </div>
      </div>

      <div className={styles.indexNumber}>{String(index).padStart(2, '0')}</div>
    </div>
  );
});

PipelineCard.propTypes = {
  phase: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    description: PropTypes.string,
    status: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    memberships: PropTypes.arrayOf(membershipShape),
  }).isRequired,
  index: PropTypes.number.isRequired,
};

export default PipelineCard;
