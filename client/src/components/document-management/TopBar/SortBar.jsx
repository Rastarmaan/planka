/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown, Icon } from 'semantic-ui-react';

import styles from './TopBar.module.scss';

const SortBar = React.memo(({ sortBy, selectedFile, onSortChange, onPreview, onDelete }) => (
  <div className={styles.sortBar}>
    <div className={styles.sortLeft}>
      <Icon name="sort" />
      <Dropdown
        text="Last modified"
        inline
        className={styles.sortDropdown}
        value={sortBy}
        onChange={(e, { value }) => onSortChange(value)}
        options={[
          { key: 'modified', text: 'Last modified', value: 'modified' },
          { key: 'name', text: 'Name', value: 'name' },
          { key: 'size', text: 'Size', value: 'size' },
        ]}
      />
    </div>
    {selectedFile && (
      <div className={styles.sortActions}>
        <Button icon className={styles.actionButton} onClick={onPreview}>
          <Icon name="eye" />
        </Button>

        <Button icon onClick={onDelete} className={styles.actionButton}>
          <Icon name="trash alternate outline" />
        </Button>
        <Dropdown icon="ellipsis vertical" direction="left" button className={styles.actionButton}>
          <Dropdown.Menu>
            <Dropdown.Item icon="share alternate" text="Share" />
            <Dropdown.Item icon="download" text="Download" />
            <Dropdown.Item icon="folder" text="Move to" />
            <Dropdown.Item icon="copy" text="Make a copy" />
          </Dropdown.Menu>
        </Dropdown>
      </div>
    )}
  </div>
));

SortBar.propTypes = {
  sortBy: PropTypes.string.isRequired,
  selectedFile: PropTypes.number,
  onSortChange: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

SortBar.defaultProps = {
  selectedFile: null,
};

export default SortBar;
