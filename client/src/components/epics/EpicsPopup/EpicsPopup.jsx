/*
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import PropTypes from 'prop-types';
import React from 'react';

import { usePopupInClosableContext } from '../../../hooks';
import EpicsStep from '../EpicsStep/EpicsStep';

const EpicsPopup = React.memo(({ children, onSelect }) => {
  const EpicsStepPopup = usePopupInClosableContext(EpicsStep);

  return <EpicsStepPopup onSelect={onSelect}>{children}</EpicsStepPopup>;
});

EpicsPopup.propTypes = {
  children: PropTypes.node.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default EpicsPopup;
