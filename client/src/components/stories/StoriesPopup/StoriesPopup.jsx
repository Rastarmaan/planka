/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import PropTypes from 'prop-types';
import React from 'react';

import { usePopupInClosableContext } from '../../../hooks';
import StoriesStep from '../StoriesStep';

const StoriesPopup = React.memo(({ children, onSelect }) => {
  const StoriesStepPopup = usePopupInClosableContext(StoriesStep);

  return <StoriesStepPopup onSelect={onSelect}>{children}</StoriesStepPopup>;
});

StoriesPopup.propTypes = {
  children: PropTypes.node.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default StoriesPopup;
