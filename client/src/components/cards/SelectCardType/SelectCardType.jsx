/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Icon, Menu } from 'semantic-ui-react';

import { CardTypes } from '../../../constants/Enums';
import { CardTypeIcons } from '../../../constants/Icons';
import selectors from '../../../selectors';

import styles from './SelectCardType.module.scss';

const DESCRIPTION_BY_TYPE = {
  [CardTypes.PROJECT]: 'common.taskAssignmentAndProjectCompletion',
  [CardTypes.STORY]: 'common.referenceDataAndKnowledgeStorage',
  [CardTypes.EPIC]: 'common.epicCollectAndOrganizeStories',
};

const ALL_CARD_TYPES = [CardTypes.PROJECT, CardTypes.STORY, CardTypes.EPIC];

const SelectCardType = React.memo(({ value, onSelect }) => {
  const [t] = useTranslation();
  const board = useSelector(selectors.selectCurrentBoard);

  const allowedTypes = useMemo(() => {
    if (board && board.cardTypes && board.cardTypes.length > 0) {
      // eslint-disable-next-line no-console
      console.log('Board cardTypes:', board.cardTypes);
      return ALL_CARD_TYPES.filter((type) => board.cardTypes.includes(type));
    }
    // eslint-disable-next-line no-console
    console.log('No cardTypes restriction, showing all types. Board:', board);
    return ALL_CARD_TYPES;
  }, [board]);

  const handleSelectClick = useCallback(
    (_, { value: nextValue }) => {
      if (nextValue !== value) {
        onSelect(nextValue);
      }
    },
    [value, onSelect],
  );

  return (
    <Menu secondary vertical className={styles.menu}>
      {allowedTypes.map((type) => (
        <Menu.Item
          key={type}
          value={type}
          active={type === value}
          className={styles.menuItem}
          onClick={handleSelectClick}
        >
          <Icon name={CardTypeIcons[type]} className={styles.menuItemIcon} />
          <div className={styles.menuItemTitle}>{t(`common.${type}`)}</div>
          <p className={styles.menuItemDescription}>{t(DESCRIPTION_BY_TYPE[type])}</p>
        </Menu.Item>
      ))}
    </Menu>
  );
});

SelectCardType.propTypes = {
  value: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default SelectCardType;
