/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */
/* eslint-disable import/no-extraneous-dependencies */

import classNames from 'classnames';
import upperFirst from 'lodash/upperFirst';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import DateObject from 'react-date-object';
import persian from 'react-date-object/calendars/persian';
import persianEn from 'react-date-object/locales/persian_en';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Icon } from 'semantic-ui-react';

import selectors from '../../../selectors';
import getDateFormat from '../../../utils/get-date-format';

import styles from './StartDateChip.module.scss';

const Sizes = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
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

const StartDateChip = React.memo(({ value, size, onClick }) => {
  const [t] = useTranslation();

  const board = useSelector(selectors.selectCurrentBoard);
  const isJalali = board?.calendarType === 'jalali';

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

  const contentNode = (
    <span
      className={classNames(
        styles.wrapper,
        styles[`wrapper${upperFirst(size)}`],
        onClick && styles.wrapperHoverable,
      )}
    >
      <Icon name="calendar outline" className={styles.icon} />
      {formattedDate}
    </span>
  );

  return onClick ? (
    <button type="button" disabled={false} className={styles.button} onClick={onClick}>
      {contentNode}
    </button>
  ) : (
    contentNode
  );
});

StartDateChip.propTypes = {
  value: PropTypes.instanceOf(Date).isRequired,
  size: PropTypes.oneOf(Object.values(Sizes)),
  onClick: PropTypes.func,
};

StartDateChip.defaultProps = {
  size: Sizes.MEDIUM,
  onClick: undefined,
};

export default StartDateChip;
