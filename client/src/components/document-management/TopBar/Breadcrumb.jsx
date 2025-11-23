/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Icon } from 'semantic-ui-react';

import styles from './Breadcrumb.module.scss';

const Breadcrumb = React.memo(
  ({ sectionTitle, currentPath, onBreadcrumbClick, onFolderCreate }) => (
    <div className={styles.breadcrumb}>
      <span
        role="button"
        tabIndex={0}
        className={styles.breadcrumbItem}
        onClick={() => onBreadcrumbClick(-1)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onBreadcrumbClick(-1);
          }
        }}
      >
        {sectionTitle}
      </span>
      {currentPath.map((folder, index) => (
        <React.Fragment key={folder.id}>
          <Icon name="angle right" className={styles.breadcrumbSeparator} />
          <span
            role="button"
            tabIndex={0}
            className={styles.breadcrumbItem}
            onClick={() => onBreadcrumbClick(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onBreadcrumbClick(index);
              }
            }}
          >
            {folder.name}
          </span>
        </React.Fragment>
      ))}
      {currentPath.length > 0 && (
        <Dropdown icon="angle down" className={styles.breadcrumbDropdown} direction="right">
          <Dropdown.Menu>
            <Dropdown.Item text="New folder" icon="folder" onClick={onFolderCreate} />
            <Dropdown.Item text="Upload files" icon="upload" />
            <Dropdown.Item text="Upload folder" icon="folder open" />
          </Dropdown.Menu>
        </Dropdown>
      )}
    </div>
  ),
);

Breadcrumb.propTypes = {
  sectionTitle: PropTypes.string.isRequired,
  currentPath: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onBreadcrumbClick: PropTypes.func.isRequired,
  onFolderCreate: PropTypes.func.isRequired,
};

export default Breadcrumb;
