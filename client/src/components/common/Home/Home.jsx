/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import { useSelector } from 'react-redux';

import selectors from '../../../selectors';
import { HomeViews, UserRoles } from '../../../constants/Enums';
import GridProjectsView from './GridProjectsView';
import GroupedProjectsView from './GroupedProjectsView';
import ManagerDashboard from '../../manager-dashboard/ManagerDashboard';

import styles from './Home.module.scss';

const Home = React.memo(() => {
  const view = useSelector(selectors.selectHomeView);
  const currentUser = useSelector(selectors.selectCurrentUser);

  if (currentUser?.role === UserRoles.MANAGER) {
    return <ManagerDashboard />;
  }

  let View;
  switch (view) {
    case HomeViews.GRID_PROJECTS:
      View = GridProjectsView;

      break;
    case HomeViews.GROUPED_PROJECTS:
      View = GroupedProjectsView;

      break;
    default:
  }

  return (
    <div className={styles.wrapper}>
      <View />
    </div>
  );
});

export default Home;
