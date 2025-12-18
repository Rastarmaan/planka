/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';

import ProjectPipeline from '../ProjectPipeline';
import ProjectProfile from '../ProjectProfile';
import ProjectHistory from '../ProjectHistory';

import styles from './DashboardContent.module.scss';

const DashboardContent = React.memo(({ activeTab, selectedProjectId }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'managerView':
        return <ProjectPipeline selectedProjectId={selectedProjectId} />;
      case 'projectAnalysis':
        return <div className={styles.placeholder}>داشبورد تحلیل پروژه</div>;
      case 'projectProfile':
        return <ProjectProfile />;
      case 'projectHistory':
        return <ProjectHistory />;
      default:
        return null;
    }
  };

  if (activeTab === 'managerView') {
    return <div className={styles.scrollableContainer}>{renderContent()}</div>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.contentArea}>{renderContent()}</div>
    </div>
  );
});

DashboardContent.propTypes = {
  activeTab: PropTypes.string.isRequired,
  selectedProjectId: PropTypes.string,
};

DashboardContent.defaultProps = {
  selectedProjectId: null,
};

export default DashboardContent;
