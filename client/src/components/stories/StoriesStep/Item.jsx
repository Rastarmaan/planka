/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from 'semantic-ui-react';

import { CardTypes } from '../../../constants/Enums';
import { CardTypeIcons } from '../../../constants/Icons';
import selectors from '../../../selectors';

import styles from './Item.module.scss';

const Item = React.memo(({ id, onSelect }) => {
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);

  const story = useSelector((state) => selectCardById(state, id));

  const handleSelectClick = useCallback(() => {
    if (story.isPersisted) {
      onSelect(id);
    }
  }, [id, onSelect, story.isPersisted]);

  return (
    <div className={styles.wrapper}>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                   jsx-a11y/no-static-element-interactions */}
      <span className={styles.name} onClick={handleSelectClick}>
        <Icon name={CardTypeIcons[CardTypes.STORY]} className={styles.nameIcon} />
        {story.name}
      </span>
    </div>
  );
});

Item.propTypes = {
  id: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default Item;
