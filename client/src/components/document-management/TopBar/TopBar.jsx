/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';

import Breadcrumb from './Breadcrumb';
import ViewToggle from './ViewToggle';
import styles from './TopBar.module.scss';

const TopBar = React.memo(
  ({
    sectionTitle,
    currentPath,
    view,
    onBreadcrumbClick,
    onFolderCreate,
    onFileUpload,
    onViewChange,
  }) => (
    <div className={styles.topBar}>
      <Breadcrumb
        sectionTitle={sectionTitle}
        currentPath={currentPath}
        onBreadcrumbClick={onBreadcrumbClick}
        onFolderCreate={onFolderCreate}
        onFileUpload={onFileUpload}
      />

      <div className={styles.topBarActions}>
        <ViewToggle view={view} onViewChange={onViewChange} />
      </div>
    </div>
  ),
);

TopBar.propTypes = {
  sectionTitle: PropTypes.string.isRequired,
  currentPath: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
    }),
  ).isRequired,
  view: PropTypes.oneOf(['grid', 'list']).isRequired,
  onBreadcrumbClick: PropTypes.func.isRequired,
  onFolderCreate: PropTypes.func.isRequired,
  onFileUpload: PropTypes.func.isRequired,
  onViewChange: PropTypes.func.isRequired,
};

export default TopBar;
