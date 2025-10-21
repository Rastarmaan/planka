/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Icon, Menu } from 'semantic-ui-react';

import entryActions from '../../../../../entry-actions';
import selectors from '../../../../../selectors';

import styles from './CalendarType.module.scss';

const CALENDAR_TYPES = {
  GREGORIAN: 'gregorian',
  JALALI: 'jalali',
};

const DESCRIPTION_BY_TYPE = {
  [CALENDAR_TYPES.GREGORIAN]: 'common.gregorianCalendarDescription',
  [CALENDAR_TYPES.JALALI]: 'common.jalaliCalendarDescription',
};

const ICON_BY_TYPE = {
  [CALENDAR_TYPES.GREGORIAN]: 'calendar outline',
  [CALENDAR_TYPES.JALALI]: 'calendar alternate outline',
};

const CalendarType = React.memo(() => {
  const selectBoardById = useMemo(() => selectors.makeSelectBoardById(), []);

  const boardId = useSelector((state) => selectors.selectCurrentModal(state).params.id);
  const board = useSelector((state) => selectBoardById(state, boardId));

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const handleSelectClick = useCallback(
    (_, { value: calendarType }) => {
      if (calendarType !== board.calendarType) {
        dispatch(
          entryActions.updateBoard(boardId, {
            calendarType,
          }),
        );
      }
    },
    [boardId, board.calendarType, dispatch],
  );

  return (
    <Menu secondary vertical className={styles.menu}>
      {Object.values(CALENDAR_TYPES).map((type) => (
        <Menu.Item
          key={type}
          value={type}
          active={type === board.calendarType}
          className={styles.menuItem}
          onClick={handleSelectClick}
        >
          <Icon name={ICON_BY_TYPE[type]} className={styles.menuItemIcon} />
          <div className={styles.menuItemTitle}>{t(`common.${type}`, { context: 'calendar' })}</div>
          <p className={styles.menuItemDescription}>{t(DESCRIPTION_BY_TYPE[type])}</p>
        </Menu.Item>
      ))}
    </Menu>
  );
});

export default CalendarType;
