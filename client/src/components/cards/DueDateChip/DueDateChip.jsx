/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */
/* eslint-disable import/no-extraneous-dependencies */

import classNames from 'classnames';
import upperFirst from 'lodash/upperFirst';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef } from 'react';
import DateObject from 'react-date-object';
import persian from 'react-date-object/calendars/persian';
import persianEn from 'react-date-object/locales/persian_en';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { useForceUpdate } from '../../../lib/hooks';

import selectors from '../../../selectors';
import getDateFormat from '../../../utils/get-date-format';

import styles from './DueDateChip.module.scss';

const Sizes = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
};

const Statuses = {
  DUE_SOON: 'dueSoon',
  OVERDUE: 'overdue',
  COMPLETED: 'completed',
};

const LONG_DATE_FORMAT_BY_SIZE = {
  [Sizes.TINY]: 'longDate',
  [Sizes.SMALL]: 'longDate',
  [Sizes.MEDIUM]: 'longDateTime',
};

const FULL_DATE_FORMAT_BY_SIZE = {
  [Sizes.TINY]: 'fullDate',
  [Sizes.SMALL]: 'fullDate',
  [Sizes.MEDIUM]: 'fullDateTime',
};

const STATUS_ICON_PROPS_BY_STATUS = {
  [Statuses.DUE_SOON]: {
    name: 'hourglass half',
    color: 'orange',
  },
  [Statuses.OVERDUE]: {
    name: 'hourglass end',
    color: 'red',
  },
  [Statuses.COMPLETED]: {
    name: 'checkmark',
    color: 'green',
  },
};

const getStatus = (date, isCompleted) => {
  if (isCompleted) {
    return Statuses.COMPLETED;
  }

  const secondsLeft = Math.floor((date.getTime() - new Date().getTime()) / 1000);

  if (secondsLeft <= 0) {
    return Statuses.OVERDUE;
  }

  if (secondsLeft <= 24 * 60 * 60) {
    return Statuses.DUE_SOON;
  }

  return null;
};

const DueDateChip = React.memo(
  ({ value, size, isCompleted, isDisabled, withStatus, withStatusIcon, onClick }) => {
    const [t] = useTranslation();
    const forceUpdate = useForceUpdate();

    const board = useSelector(selectors.selectCurrentBoard);
    const isJalali = board?.calendarType === 'jalali';

    const statusRef = useRef(null);
    statusRef.current = withStatus ? getStatus(value, isCompleted) : null;

    const intervalRef = useRef(null);

    const dateFormat = getDateFormat(
      value,
      LONG_DATE_FORMAT_BY_SIZE[size],
      FULL_DATE_FORMAT_BY_SIZE[size],
    );

    const formattedDate = useMemo(() => {
      if (isJalali) {
        const dateObj = new DateObject({
          date: value,
          calendar: persian,
          locale: persianEn,
        });

        if (size === Sizes.TINY || size === Sizes.SMALL) {
          return dateObj.format('MMMM DD');
        }
        const datePart = dateObj.format('MMMM DD');
        const timePart = dateObj.format('HH:mm');
        return `${datePart} at ${timePart}`;
      }

      return t(`format:${dateFormat}`, {
        value,
        postProcess: 'formatDate',
      });
    }, [isJalali, value, size, dateFormat, t]);

    useEffect(() => {
      if (
        withStatus &&
        statusRef.current !== Statuses.OVERDUE &&
        statusRef.current !== Statuses.COMPLETED
      ) {
        intervalRef.current = setInterval(() => {
          const status = getStatus(value, isCompleted);

          if (status !== statusRef.current) {
            forceUpdate();
          }

          if (status === Statuses.OVERDUE) {
            clearInterval(intervalRef.current);
          }
        }, 1000);
      }

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [value, isCompleted, withStatus, forceUpdate]);

    const contentNode = (
      <span
        className={classNames(
          styles.wrapper,
          styles[`wrapper${upperFirst(size)}`],
          !withStatusIcon && statusRef.current && styles[`wrapper${upperFirst(statusRef.current)}`],
          onClick && styles.wrapperHoverable,
        )}
      >
        {formattedDate}
        {withStatusIcon && statusRef.current && (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <Icon {...STATUS_ICON_PROPS_BY_STATUS[statusRef.current]} className={styles.statusIcon} />
        )}
      </span>
    );

    return onClick ? (
      <button type="button" disabled={isDisabled} className={styles.button} onClick={onClick}>
        {contentNode}
      </button>
    ) : (
      contentNode
    );
  },
);

DueDateChip.propTypes = {
  value: PropTypes.instanceOf(Date).isRequired,
  size: PropTypes.oneOf(Object.values(Sizes)),
  isCompleted: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool,
  withStatus: PropTypes.bool.isRequired,
  withStatusIcon: PropTypes.bool,
  onClick: PropTypes.func,
};

DueDateChip.defaultProps = {
  size: Sizes.MEDIUM,
  isDisabled: false,
  withStatusIcon: false,
  onClick: undefined,
};

export default DueDateChip;
