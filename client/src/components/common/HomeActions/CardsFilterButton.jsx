/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import classNames from 'classnames';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon } from 'semantic-ui-react';

import styles from './GlobalLabels.module.scss';

const CardsFilterButton = React.memo(() => {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate('/?view=filters');
  }, [navigate]);

  return (
    <button type="button" className={classNames(styles.button)} onClick={handleClick}>
      <Icon fitted name="filter" />
      <span className={styles.text}>
        {t('common.cardsFilter', { defaultValue: 'Cards Filter' })}
      </span>
    </button>
  );
});

export default CardsFilterButton;
