/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import classNames from 'classnames';
import React from 'react';

import Filters from './Filters';
import GlobalLabels from './GlobalLabels';
import CardsFilterButton from './CardsFilterButton';
import DocumentManagementButton from './DocumentManagementButton';
import ProjectCategories from './ProjectCategories';
import RightSide from './RightSide';

import styles from './HomeActions.module.scss';

const HomeActions = React.memo(() => (
  <div className={styles.wrapper}>
    <div className={styles.content}>
      <div className={styles.actions}>
        <div className={classNames(styles.action, styles.actionFilters)}>
          <Filters />
        </div>
        <div className={styles.action}>
          <DocumentManagementButton />
        </div>
        <div className={styles.action}>
          <GlobalLabels />
        </div>
        <div className={styles.action}>
          <CardsFilterButton />
        </div>
        <div className={styles.action}>
          <ProjectCategories />
        </div>
        <div className={classNames(styles.action, styles.actionRightSide)}>
          <RightSide />
        </div>
      </div>
    </div>
  </div>
));

export default HomeActions;
