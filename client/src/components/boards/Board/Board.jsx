/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import { useSelector } from 'react-redux';

import { BoardContexts, BoardViews } from '../../../constants/Enums';
import ModalTypes from '../../../constants/ModalTypes';
import selectors from '../../../selectors';
import BoardActivitiesModal from '../../activities/BoardActivitiesModal';
import BoardReleasesModal from '../../board-releases/BoardReleasesModal';
import BoardVersionsModal from '../../board-versions/BoardVersionsModal';
import CardModal from '../../cards/CardModal';
import EndlessContent from './EndlessContent';
import FiniteContent from './FiniteContent';
import GanttContent from './GanttContent';
import KanbanContent from './KanbanContent';

const Board = React.memo(() => {
  const board = useSelector(selectors.selectCurrentBoard);
  const modal = useSelector(selectors.selectCurrentModal);
  const isCardModalOpened = useSelector((state) => !!selectors.selectPath(state).cardId);

  let Content;
  if (board.view === BoardViews.KANBAN) {
    Content = KanbanContent;
  } else if (board.view === BoardViews.GANTT) {
    Content = GanttContent;
  } else {
    switch (board.context) {
      case BoardContexts.BOARD:
        Content = FiniteContent;

        break;
      case BoardContexts.ARCHIVE:
      case BoardContexts.TRASH:
        Content = EndlessContent;

        break;
      default:
    }
  }

  let modalNode = null;
  if (isCardModalOpened) {
    modalNode = <CardModal />;
  } else if (modal) {
    switch (modal.type) {
      case ModalTypes.BOARD_ACTIVITIES:
        modalNode = <BoardActivitiesModal />;

        break;
      case ModalTypes.BOARD_VERSIONS:
        modalNode = <BoardVersionsModal />;

        break;
      case ModalTypes.BOARD_RELEASES:
        modalNode = <BoardReleasesModal />;

        break;
      default:
    }
  }

  return (
    <>
      <Content />
      {modalNode}
    </>
  );
});

export default Board;
