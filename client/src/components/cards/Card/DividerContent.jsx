/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';

import styles from './DividerContent.module.scss';

const DividerContent = React.memo(() => (
  <div className={styles.wrapper}>
    <div className={styles.line} />
  </div>
));

export default DividerContent;
