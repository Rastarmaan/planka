/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';

import styles from './StorageInfo.module.scss';

const StorageInfo = React.memo(() => (
  <div className={styles.storageInfo}>
    <div className={styles.storageBar}>
      <div className={styles.storageUsed} style={{ width: '0.5%' }} />
    </div>
    <span className={styles.storageText}>265 KB of 50 GB used</span>
  </div>
));

export default StorageInfo;
