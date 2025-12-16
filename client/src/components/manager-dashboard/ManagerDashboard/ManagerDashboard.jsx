/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import selectors from '../../../selectors';
import DashboardHeader from '../DashboardHeader';
import DashboardTabs from '../DashboardTabs';
import DashboardSidebar from '../DashboardSidebar';
import DashboardContent from '../DashboardContent';

import styles from './ManagerDashboard.module.scss';

const TABS = {
  MANAGER_VIEW: 'managerView',
  PROJECT_ANALYSIS: 'projectAnalysis',
  PROJECT_PROFILE: 'projectProfile',
  PROJECT_HISTORY: 'projectHistory',
};

const ManagerDashboard = React.memo(() => {
  const currentUser = useSelector(selectors.selectCurrentUser);
  const [activeTab, setActiveTab] = useState(TABS.MANAGER_VIEW);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  return (
    <div className={styles.wrapper}>
      <DashboardSidebar
        selectedProjectId={selectedProjectId}
        onProjectSelect={setSelectedProjectId}
      />
      <div className={styles.mainContainer}>
        <DashboardHeader user={currentUser} />
        <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={TABS} />
        <DashboardContent activeTab={activeTab} selectedProjectId={selectedProjectId} />
      </div>
    </div>
  );
});

export default ManagerDashboard;
