/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'semantic-ui-react';

import styles from './ViewToggle.module.scss';

const ViewToggle = React.memo(({ view, onViewChange }) => (
  <div className={styles.viewToggle}>
    <Button
      icon
      className={view === 'grid' ? styles.viewActive : ''}
      onClick={() => onViewChange('grid')}
    >
      <Icon name="grid layout" />
    </Button>
    <Button
      icon
      className={view === 'list' ? styles.viewActive : ''}
      onClick={() => onViewChange('list')}
    >
      <Icon name="list" />
    </Button>
  </div>
));

ViewToggle.propTypes = {
  view: PropTypes.oneOf(['grid', 'list']).isRequired,
  onViewChange: PropTypes.func.isRequired,
};

export default ViewToggle;
