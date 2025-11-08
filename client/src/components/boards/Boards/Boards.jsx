/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useRef, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'semantic-ui-react';
import { closePopup, usePopup } from '../../../lib/popup';

import DroppableTypes from '../../../constants/DroppableTypes';
import entryActions from '../../../entry-actions';
import selectors from '../../../selectors';
import {
  selectBoardIdsForCurrentProject,
  selectAllProjectsForImport,
} from '../../../selectors/projects';
import ImportBoardModal from '../ImportBoardModal';
import AddStep from './AddStep';
import Item from './Item';

import globalStyles from '../../../styles.module.scss';
import styles from './Boards.module.scss';

const Boards = React.memo(() => {
  const boardIds = useSelector(selectBoardIdsForCurrentProject);
  const { projectId: currentProjectId, boardId: currentBoardId } = useSelector(
    selectors.selectPath,
  );

  const projects = useSelector(selectAllProjectsForImport);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const canAdd = useSelector((state) => {
    const isEditModeEnabled = selectors.selectIsEditModeEnabled(state); // TODO: move out?

    if (!isEditModeEnabled) {
      return isEditModeEnabled;
    }

    return selectors.selectIsCurrentUserManagerForCurrentProject(state);
  });

  const dispatch = useDispatch();

  const tabsWrapperRef = useRef(null);

  const handleDragStart = useCallback(() => {
    document.body.classList.add(globalStyles.dragging);
    closePopup();
  }, []);

  const handleDragEnd = useCallback(
    ({ draggableId, source, destination }) => {
      document.body.classList.remove(globalStyles.dragging);

      if (!destination || source.index === destination.index) {
        return;
      }

      dispatch(entryActions.moveBoard(draggableId, destination.index));
    },
    [dispatch],
  );

  const handleWheel = useCallback(({ deltaY }) => {
    tabsWrapperRef.current.scrollBy({
      left: deltaY,
    });
  }, []);

  const handleOpenImportModal = useCallback(() => {
    setIsImportModalOpen(true);
    closePopup();
  }, []);

  const handleCloseImportModal = useCallback(() => {
    setIsImportModalOpen(false);
  }, []);

  const handleImport = useCallback(
    async (importData) => {
      dispatch(entryActions.importBoardToCurrentProject(importData));
    },
    [dispatch],
  );

  const AddPopup = usePopup(AddStep);

  return (
    <>
      <div className={styles.wrapper} onWheel={handleWheel}>
        <div ref={tabsWrapperRef} className={styles.tabsWrapper}>
          <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <Droppable droppableId="boards" type={DroppableTypes.BOARD} direction="horizontal">
              {({ innerRef, droppableProps, placeholder }) => (
                // eslint-disable-next-line react/jsx-props-no-spreading
                <div {...droppableProps} ref={innerRef} className={styles.tabs}>
                  {boardIds.map((boardId, index) => (
                    <Item key={boardId} id={boardId} index={index} />
                  ))}
                  {placeholder}
                  {canAdd && (
                    <AddPopup onOpenImportModal={handleOpenImportModal}>
                      <Button icon="plus" className={styles.addButton} />
                    </AddPopup>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
      {isImportModalOpen && (
        <ImportBoardModal
          projects={projects}
          currentProjectId={currentProjectId || ''}
          currentBoardId={currentBoardId || ''}
          onImport={handleImport}
          onClose={handleCloseImportModal}
        />
      )}
    </>
  );
});

export default Boards;
