/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import PropTypes from 'prop-types';
import React from 'react';

import { usePopupInClosableContext } from '../../../hooks';
import SubTasksStep from '../SubTasksStep';

const SubTasksPopup = React.memo(({ currentCardId, children, onSelect, onCreate }) => {
  const SubTasksStepPopup = usePopupInClosableContext(SubTasksStep);

  return (
    <SubTasksStepPopup currentCardId={currentCardId} onSelect={onSelect} onCreate={onCreate}>
      {children}
    </SubTasksStepPopup>
  );
});

SubTasksPopup.propTypes = {
  currentCardId: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onSelect: PropTypes.func.isRequired,
  onCreate: PropTypes.func,
};

SubTasksPopup.defaultProps = {
  onCreate: undefined,
};

export default SubTasksPopup;
