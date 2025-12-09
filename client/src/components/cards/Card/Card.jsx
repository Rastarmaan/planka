/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import classNames from 'classnames';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Icon } from 'semantic-ui-react';
import { closePopup, usePopup } from '../../../lib/popup';
import { push } from '../../../lib/redux-router';

import { BoardMembershipRoles, CardTypes, UserRoles } from '../../../constants/Enums';
import Paths from '../../../constants/Paths';
import selectors from '../../../selectors';
import { isDividerCard } from '../../../utils/helpers';
import { getCardColorHex } from '../../../constants/CardColors';
import ActionsStep from './ActionsStep';
import DividerContent from './DividerContent';
import EditName from './EditName';
import InlineContent from './InlineContent';
import ProjectContent from './ProjectContent';
import StoryContent from './StoryContent';

import globalStyles from '../../../styles.module.scss';
import styles from './Card.module.scss';

const Card = React.memo(({ id, isInline }) => {
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);
  const selectIsCardWithIdRecent = useMemo(() => selectors.makeSelectIsCardWithIdRecent(), []);
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);

  const card = useSelector((state) => selectCardById(state, id));
  const list = useSelector((state) => selectListById(state, card.listId));

  const isHighlightedAsRecent = useSelector((state) => {
    const { turnOffRecentCardHighlighting } = selectors.selectCurrentUser(state);

    if (turnOffRecentCardHighlighting) {
      return false;
    }

    return selectIsCardWithIdRecent(state, id);
  });

  const canUseActions = useSelector((state) => {
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

  const dispatch = useDispatch();
  const [isEditNameOpened, setIsEditNameOpened] = useState(false);

  const actionsPopupRef = useRef(null);

  const handleClick = useCallback(() => {
    if (document.activeElement) {
      document.activeElement.blur();
    }

    dispatch(push(Paths.CARDS.replace(':id', id)));
  }, [id, dispatch]);

  const handleContextMenu = useCallback((event) => {
    if (!actionsPopupRef.current) {
      return;
    }

    event.preventDefault();

    closePopup();
    actionsPopupRef.current.open();
  }, []);

  const handleNameEdit = useCallback(() => {
    setIsEditNameOpened(true);
  }, []);

  const handleEditNameClose = useCallback(() => {
    setIsEditNameOpened(false);
  }, []);

  const ActionsPopup = usePopup(ActionsStep);

  if (isEditNameOpened) {
    return <EditName cardId={id} onClose={handleEditNameClose} />;
  }

  const isDivider = isDividerCard(card.name);

  if (isDivider) {
    return (
      <div
        className={classNames(styles.wrapper, styles.wrapperDivider, 'card')}
        onContextMenu={handleContextMenu}
      >
        <DividerContent />
        {canUseActions && (
          <ActionsPopup ref={actionsPopupRef} cardId={id} isDivider onNameEdit={handleNameEdit}>
            <Button className={styles.actionsButton}>
              <Icon fitted name="pencil" size="small" />
            </Button>
          </ActionsPopup>
        )}
      </div>
    );
  }

  let Content;
  if (isInline) {
    Content = InlineContent;
  } else {
    switch (card.type) {
      case CardTypes.PROJECT:
        Content = ProjectContent;

        break;
      case CardTypes.STORY:
        Content = StoryContent;

        break;
      case CardTypes.EPIC:
        Content = StoryContent;

        break;
      default:
    }
  }

  const colorLineNode = list.color && (
    <div
      className={classNames(
        styles.colorLine,
        globalStyles[`background${upperFirst(camelCase(list.color))}`],
      )}
    />
  );

  const cardBackgroundColor = card.color ? getCardColorHex(card.color) : null;

  return (
    <div
      className={classNames(styles.wrapper, isHighlightedAsRecent && styles.wrapperRecent, 'card')}
      style={cardBackgroundColor ? { backgroundColor: cardBackgroundColor } : undefined}
    >
      {card.isPersisted ? (
        <>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                       jsx-a11y/no-static-element-interactions */}
          <div
            className={classNames(styles.content, card.isClosed && styles.contentDisabled)}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
          >
            <Content cardId={id} />
            {colorLineNode}
          </div>
          {canUseActions && (
            <ActionsPopup ref={actionsPopupRef} cardId={id} onNameEdit={handleNameEdit}>
              <Button className={styles.actionsButton}>
                <Icon fitted name="pencil" size="small" />
              </Button>
            </ActionsPopup>
          )}
        </>
      ) : (
        <span className={classNames(styles.content, card.isClosed && styles.contentDisabled)}>
          <Content cardId={id} />
          {colorLineNode}
        </span>
      )}
    </div>
  );
});

Card.propTypes = {
  id: PropTypes.string.isRequired,
  isInline: PropTypes.bool,
};

Card.defaultProps = {
  isInline: false,
};

export default Card;
