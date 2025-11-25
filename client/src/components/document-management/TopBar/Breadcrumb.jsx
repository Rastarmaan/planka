/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Dropdown, Icon } from 'semantic-ui-react';

import styles from './Breadcrumb.module.scss';

const Breadcrumb = React.memo(
  ({ sectionTitle, currentPath, onBreadcrumbClick, onFolderCreate, onFileUpload, canUpload }) => {
    const [t] = useTranslation();
    const fileInputRef = useRef(null);

    const handleUploadClick = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    return (
      <>
        {canUpload && (
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            multiple
            onChange={onFileUpload}
          />
        )}
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
          {canUpload && (
            <Dropdown icon="angle down" className={styles.breadcrumbDropdown} direction="right">
              <Dropdown.Menu>
                <Dropdown.Item
                  text={t('documentManagement.newFolder')}
                  icon="folder"
                  onClick={onFolderCreate}
                />
                <Dropdown.Item
                  text={t('documentManagement.uploadFiles')}
                  icon="upload"
                  onClick={handleUploadClick}
                />
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
      </>
    );
  },
);

Breadcrumb.propTypes = {
  sectionTitle: PropTypes.string.isRequired,
  currentPath: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onBreadcrumbClick: PropTypes.func.isRequired,
  onFolderCreate: PropTypes.func.isRequired,
  onFileUpload: PropTypes.func.isRequired,
  canUpload: PropTypes.bool,
};

Breadcrumb.defaultProps = {
  canUpload: true,
};

export default Breadcrumb;
