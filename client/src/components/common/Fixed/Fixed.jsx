/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import { useSelector } from 'react-redux';

import selectors from '../../../selectors';
import { UserRoles } from '../../../constants/Enums';
import Header from '../Header';
import Favorites from '../Favorites';
import HomeActions from '../HomeActions';
import Project from '../../projects/Project';
import BoardActions from '../../boards/BoardActions';

import styles from './Fixed.module.scss';

const Fixed = React.memo(() => {
  const { projectId, showProjectStats } = useSelector(selectors.selectPath);
  const board = useSelector(selectors.selectCurrentBoard);
  const currentUser = useSelector(selectors.selectCurrentUser);

  if (currentUser?.role === UserRoles.MANAGER) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <Header />
      <Favorites />
      {projectId === undefined && <HomeActions />}
      {projectId && !showProjectStats && <Project />}
      {board && !board.isFetching && !showProjectStats && <BoardActions />}
    </div>
  );
});

export default Fixed;
