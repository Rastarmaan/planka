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

const PipelineCard = React.memo(({ card, index }) => {
  if (!card) {
    return null;
  }

  const themeIndex = (index - 1) % CARD_THEMES.length;
  const theme = CARD_THEMES[themeIndex];

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
          <span className={styles.userName}>{card.assignee || 'پریماه بخشی'}</span>
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

        <p className={styles.description}>{card.name || 'در حال مذاکره با عصر ایران...'}</p>

        <div className={styles.statusBadge}>
          <span>{card.listName || 'مذاکره و توافقات'}</span>
        </div>

        <div className={styles.datesRow}>
          <div className={styles.dateBadge}>
            <span>{card.dueDate || '۱۴۰۴/۰۹/۱۸'}</span>
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
            <span>{card.createdDate || '۱۴۰۴/۱۰/۲۳'}</span>
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
  card: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  index: PropTypes.number.isRequired,
};

export default PipelineCard;
