/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { Draggable } from 'react-beautiful-dnd';

import selectors from '../../../selectors';
import { BoardMembershipRoles, UserRoles } from '../../../constants/Enums';
import Card from '../Card';

import styles from './DraggableCard.module.scss';

const DraggableCard = React.memo(({ id, index, className, ...props }) => {
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);

  const card = useSelector((state) => selectCardById(state, id));

  const canDrag = useSelector((state) => {
    const currentUser = selectors.selectCurrentUser(state);
    const currentProject = selectors.selectCurrentProject(state);
    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);

    const isAdmin = currentUser?.role === UserRoles.ADMIN;
    const isProjectManager =
      currentProject && currentUser && selectors.selectIsCurrentUserManagerForCurrentProject(state);

    return (
      isAdmin ||
      isProjectManager ||
      (!!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR)
    );
  });

  return (
    <Draggable
      draggableId={`card:${id}`}
      index={index}
      isDragDisabled={!card.isPersisted || !canDrag}
    >
      {({ innerRef, draggableProps, dragHandleProps }) => (
        <div
          {...draggableProps} // eslint-disable-line react/jsx-props-no-spreading
          {...dragHandleProps} // eslint-disable-line react/jsx-props-no-spreading
          ref={innerRef}
          className={classNames(styles.wrapper, className)}
        >
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <Card {...props} id={id} />
        </div>
      )}
    </Draggable>
  );
});

DraggableCard.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  className: PropTypes.string,
};

DraggableCard.defaultProps = {
  className: undefined,
};

export default DraggableCard;
