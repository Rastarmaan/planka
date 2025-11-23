/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';

import styles from './UploadButton.module.scss';

const UploadButton = React.memo(({ currentSection, onFolderCreate }) => (
  <Dropdown
    text="Upload"
    icon="upload"
    button
    disabled={currentSection !== 'all-files'}
    className={styles.uploadButton}
  >
    <Dropdown.Menu>
      <Dropdown.Item text="New folder" icon="folder" onClick={onFolderCreate} />
      <Dropdown.Item text="Upload files" icon="upload" />
      <Dropdown.Item text="Upload folder" icon="folder open" />
    </Dropdown.Menu>
  </Dropdown>
));

UploadButton.propTypes = {
  currentSection: PropTypes.string.isRequired,
  onFolderCreate: PropTypes.func.isRequired,
};

export default UploadButton;
