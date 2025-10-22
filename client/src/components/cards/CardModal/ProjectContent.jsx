/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import classNames from 'classnames';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Button, Checkbox, Dropdown, Grid, Icon } from 'semantic-ui-react';
import { useDidUpdate } from '../../../lib/hooks';
import { push } from '../../../lib/redux-router';

import { BoardMembershipRoles, CardTypes, ListTypes } from '../../../constants/Enums';
import { CardTypeIcons } from '../../../constants/Icons';
import Paths from '../../../constants/Paths';
import { ClosableContext } from '../../../contexts';
import entryActions from '../../../entry-actions';
import { usePopupInClosableContext } from '../../../hooks';
import selectors from '../../../selectors';
import { isUsableMarkdownElement } from '../../../utils/element-helpers';
import { startStopwatch, stopStopwatch } from '../../../utils/stopwatch';
import AddAttachmentStep from '../../attachments/AddAttachmentStep';
import Attachments from '../../attachments/Attachments';
import BoardMembershipsStep from '../../board-memberships/BoardMembershipsStep';
import ConfirmationStep from '../../common/ConfirmationStep';
import EditMarkdown from '../../common/EditMarkdown';
import ExpandableMarkdown from '../../common/ExpandableMarkdown';
import AddCustomFieldGroupStep from '../../custom-field-groups/AddCustomFieldGroupStep';
import LabelChip from '../../labels/LabelChip';
import LabelsStep from '../../labels/LabelsStep';
import ListsStep from '../../lists/ListsStep';
import StoriesPopup from '../../stories/StoriesPopup';
import SubTasksPopup from '../../sub-tasks/SubTasksPopup';
import AddTaskListStep from '../../task-lists/AddTaskListStep';
import UserAvatar from '../../users/UserAvatar';
import DueDateChip from '../DueDateChip';
import EditDueDateStep from '../EditDueDateStep';
import EditStartDateStep from '../EditStartDateStep';
import EditStopwatchStep from '../EditStopwatchStep';
import StartDateChip from '../StartDateChip';
import StopwatchChip from '../StopwatchChip';
import Communication from './Communication';
import CreationDetailsStep from './CreationDetailsStep';
import CustomFieldGroups from './CustomFieldGroups';
import MoreActionsStep from './MoreActionsStep';
import NameField from './NameField';
import TaskLists from './TaskLists';

import styles from './ProjectContent.module.scss';

const ProjectContent = React.memo(() => {
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);
  const selectPrevListById = useMemo(() => selectors.makeSelectListById(), []);
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);

  const card = useSelector(selectors.selectCurrentCard);
  const board = useSelector(selectors.selectCurrentBoard);
  const userIds = useSelector(selectors.selectUserIdsForCurrentCard);
  const labelIds = useSelector(selectors.selectLabelIdsForCurrentCard);
  const attachmentIds = useSelector(selectors.selectAttachmentIdsForCurrentCard);
  const childCards = useSelector((state) => selectors.selectChildCardsByParentId(state, card?.id));

  const childCardLists = useSelector((state) => {
    if (!childCards) return {};
    const lists = {};
    childCards.forEach((childCard) => {
      const childList = selectListById(state, childCard.listId);
      if (childList) {
        lists[childCard.id] = childList;
      }
    });
    return lists;
  });

  const availableLists = useSelector(selectors.selectAvailableListsForCurrentBoard);

  const parentCard = useSelector((state) =>
    card.parentCardId ? selectCardById(state, card.parentCardId) : null,
  );

  const isJoined = useSelector(selectors.selectIsCurrentUserInCurrentCard);

  const list = useSelector((state) => selectListById(state, card.listId));

  // TODO: check availability?
  const prevList = useSelector(
    (state) => card.prevListId && selectPrevListById(state, card.prevListId),
  );

  const isInArchiveList = list.type === ListTypes.ARCHIVE;
  const isInTrashList = list.type === ListTypes.TRASH;

  const {
    canEditType,
    canEditName,
    canEditDescription,
    canEditStartDate,
    canEditDueDate,
    canEditStopwatch,
    canSubscribe,
    canJoin,
    canDuplicate,
    canMove,
    canRestore,
    canArchive,
    canDelete,
    canUseLists,
    canUseMembers,
    canUseLabels,
    canAddTaskList,
    canAddAttachment,
    canAddCustomFieldGroup,
  } = useSelector((state) => {
    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);

    let isMember = false;
    let isEditor = false;

    if (boardMembership) {
      isMember = true;
      isEditor = boardMembership.role === BoardMembershipRoles.EDITOR;
    }

    if (isInArchiveList || isInTrashList) {
      return {
        canEditType: false,
        canEditName: false,
        canEditDescription: false,
        canEditStartDate: false,
        canEditDueDate: false,
        canEditStopwatch: false,
        canSubscribe: isMember,
        canJoin: false,
        canDuplicate: false,
        canMove: false,
        canRestore: isEditor,
        canArchive: isEditor,
        canDelete: isEditor,
        canUseLists: isEditor,
        canUseMembers: false,
        canUseLabels: false,
        canAddTaskList: false,
        canAddAttachment: false,
        canAddCustomFieldGroup: false,
      };
    }

    return {
      canEditType: isEditor,
      canEditName: isEditor,
      canEditDescription: isEditor,
      canEditStartDate: isEditor,
      canEditDueDate: isEditor,
      canEditStopwatch: isEditor,
      canSubscribe: isMember,
      canJoin: isEditor,
      canDuplicate: isEditor,
      canMove: isEditor,
      canRestore: null,
      canArchive: isEditor,
      canDelete: isEditor,
      canUseLists: isEditor,
      canUseMembers: isEditor,
      canUseLabels: isEditor,
      canAddTaskList: isEditor,
      canAddAttachment: isEditor,
      canAddCustomFieldGroup: isEditor,
    };
  }, shallowEqual);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [descriptionDraft, setDescriptionDraft] = useState(null);
  const [isEditDescriptionOpened, setIsEditDescriptionOpened] = useState(false);
  const [, , setIsClosableActive] = useContext(ClosableContext);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [newSubTaskName, setNewSubTaskName] = useState('');
  const [isCreatingSubTask, setIsCreatingSubTask] = useState(false);
  const inlineInputRef = useRef(null);

  const paginatedChildCards = useMemo(() => {
    if (!childCards) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return childCards.slice(startIndex, endIndex);
  }, [childCards, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    if (!childCards) return 0;
    return Math.ceil(childCards.length / itemsPerPage);
  }, [childCards, itemsPerPage]);

  const handleListSelect = useCallback(
    (listId) => {
      dispatch(entryActions.moveCurrentCard(listId));
    },
    [dispatch],
  );

  const handleNameUpdate = useCallback(
    (name) => {
      dispatch(
        entryActions.updateCurrentCard({
          name,
        }),
      );
    },
    [dispatch],
  );

  const handleDescriptionUpdate = useCallback(
    (description) => {
      dispatch(
        entryActions.updateCurrentCard({
          description,
        }),
      );
    },
    [dispatch],
  );

  const handleDueCompletionChange = useCallback(() => {
    dispatch(
      entryActions.updateCurrentCard({
        isDueCompleted: !card.isDueCompleted,
      }),
    );
  }, [card.isDueCompleted, dispatch]);

  const handleToggleStopwatchClick = useCallback(() => {
    dispatch(
      entryActions.updateCurrentCard({
        stopwatch: card.stopwatch.startedAt
          ? stopStopwatch(card.stopwatch)
          : startStopwatch(card.stopwatch),
      }),
    );
  }, [card.stopwatch, dispatch]);

  const handleRestoreClick = useCallback(() => {
    dispatch(entryActions.moveCurrentCard(card.prevListId, undefined, true));
  }, [card.prevListId, dispatch]);

  const handleArchiveConfirm = useCallback(() => {
    dispatch(entryActions.moveCurrentCardToArchive());
  }, [dispatch]);

  const handleDeleteConfirm = useCallback(() => {
    if (isInTrashList) {
      dispatch(entryActions.deleteCurrentCard());
    } else {
      dispatch(entryActions.moveCurrentCardToTrash());
    }
  }, [isInTrashList, dispatch]);

  const handleUserSelect = useCallback(
    (userId) => {
      dispatch(entryActions.addUserToCurrentCard(userId));
    },
    [dispatch],
  );

  const handleUserDeselect = useCallback(
    (userId) => {
      dispatch(entryActions.removeUserFromCurrentCard(userId));
    },
    [dispatch],
  );

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleChildCardListChange = useCallback(
    (childCardId, newListId) => {
      dispatch(entryActions.moveCard(childCardId, newListId));
    },
    [dispatch],
  );

  const handleChildCardClick = useCallback(
    (childCardId) => {
      dispatch(push(Paths.CARDS.replace(':id', childCardId)));
    },
    [dispatch],
  );

  const handleStorySelect = useCallback(
    (storyId) => {
      dispatch(entryActions.addStoryToCurrentCard(storyId));
    },
    [dispatch],
  );

  const handleRemoveParentStory = useCallback(() => {
    dispatch(entryActions.removeStoryFromCurrentCard());
  }, [dispatch]);

  const handleTaskSelect = useCallback(
    (taskId) => {
      dispatch(entryActions.addStoryToCurrentCard(taskId));
    },
    [dispatch],
  );

  const handleCreateSubTask = useCallback(
    (name) => {
      dispatch(
        entryActions.createCard(card.listId, {
          name,
          type: CardTypes.PROJECT,
          parentCardId: card.id,
        }),
      );
    },
    [card.id, card.listId, dispatch],
  );

  const handleNewSubTaskNameChange = useCallback((e) => {
    setNewSubTaskName(e.target.value);
  }, []);

  const handleCreateInlineSubTask = useCallback(() => {
    if (newSubTaskName.trim()) {
      handleCreateSubTask(newSubTaskName.trim());
      setNewSubTaskName('');
      setIsCreatingSubTask(false);
    }
  }, [newSubTaskName, handleCreateSubTask]);

  const handleSubTaskKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCreateInlineSubTask();
      } else if (e.key === 'Escape') {
        setNewSubTaskName('');
        setIsCreatingSubTask(false);
      }
    },
    [handleCreateInlineSubTask],
  );

  const handleAddSubTaskClick = useCallback(() => {
    setIsCreatingSubTask(true);
    setTimeout(() => {
      if (inlineInputRef.current) {
        inlineInputRef.current.focus();
      }
    }, 0);
  }, []);

  const handleCancelInlineSubTask = useCallback(() => {
    setNewSubTaskName('');
    setIsCreatingSubTask(false);
  }, []);

  const handleLabelSelect = useCallback(
    (labelId) => {
      dispatch(entryActions.addLabelToCurrentCard(labelId));
    },
    [dispatch],
  );

  const handleLabelDeselect = useCallback(
    (labelId) => {
      dispatch(entryActions.removeLabelFromCurrentCard(labelId));
    },
    [dispatch],
  );

  const handleCustomFieldGroupCreate = useCallback(
    (data) => {
      dispatch(entryActions.createCustomFieldGroupInCurrentCard(data));
    },
    [dispatch],
  );

  const handleToggleJointClick = useCallback(() => {
    if (isJoined) {
      dispatch(entryActions.removeCurrentUserFromCurrentCard());
    } else {
      dispatch(entryActions.addCurrentUserToCurrentCard());
    }
  }, [isJoined, dispatch]);

  const handleToggleSubscriptionClick = useCallback(() => {
    dispatch(
      entryActions.updateCurrentCard({
        isSubscribed: !card.isSubscribed,
      }),
    );
  }, [card.isSubscribed, dispatch]);

  const handleEditDescriptionClick = useCallback((event) => {
    if (window.getSelection().toString() || isUsableMarkdownElement(event.target)) {
      return;
    }

    setIsEditDescriptionOpened(true);
  }, []);

  const handleEditDescriptionClose = useCallback((nextDescriptionDraft) => {
    setDescriptionDraft(nextDescriptionDraft);
    setIsEditDescriptionOpened(false);
  }, []);

  useDidUpdate(() => {
    if (!canEditDescription) {
      setIsEditDescriptionOpened(false);
    }
  }, [canEditDescription]);

  useDidUpdate(() => {
    setIsClosableActive(isEditDescriptionOpened);
  }, [isEditDescriptionOpened]);

  useEffect(() => {
    if (card?.id) {
      dispatch(entryActions.fetchChildCards(card.id));
    }
  }, [card?.id, dispatch]);

  const CreationDetailsPopup = usePopupInClosableContext(CreationDetailsStep);
  const BoardMembershipsPopup = usePopupInClosableContext(BoardMembershipsStep);
  const LabelsPopup = usePopupInClosableContext(LabelsStep);
  const ListsPopup = usePopupInClosableContext(ListsStep);
  const EditStartDatePopup = usePopupInClosableContext(EditStartDateStep);
  const EditDueDatePopup = usePopupInClosableContext(EditDueDateStep);
  const EditStopwatchPopup = usePopupInClosableContext(EditStopwatchStep);
  const AddTaskListPopup = usePopupInClosableContext(AddTaskListStep);
  const AddAttachmentPopup = usePopupInClosableContext(AddAttachmentStep);
  const AddCustomFieldGroupPopup = usePopupInClosableContext(AddCustomFieldGroupStep);
  const MoreActionsPopup = usePopupInClosableContext(MoreActionsStep);
  const ConfirmationPopup = usePopupInClosableContext(ConfirmationStep);

  return (
    <Grid className={styles.wrapper}>
      <Grid.Row className={styles.headerPadding}>
        <Grid.Column width={16} className={styles.headerPadding}>
          <div className={styles.headerWrapper}>
            <Icon name={CardTypeIcons[CardTypes.PROJECT]} className={styles.moduleIcon} />
            <div className={styles.headerTitleWrapper}>
              {canEditName ? (
                <NameField defaultValue={card.name} onUpdate={handleNameUpdate} />
              ) : (
                <div className={styles.headerTitle}>{card.name}</div>
              )}
            </div>
          </div>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row className={styles.modalPadding}>
        <Grid.Column width={12} className={styles.contentPadding}>
          {(card.startDate ||
            card.dueDate ||
            card.stopwatch ||
            board.alwaysDisplayCardCreator ||
            userIds.length > 0 ||
            labelIds.length > 0) && (
            <div className={styles.moduleWrapper}>
              {board.alwaysDisplayCardCreator && (
                <div className={styles.attachments}>
                  <div className={styles.text}>
                    {t('common.creator', {
                      context: 'title',
                    })}
                  </div>
                  <span className={styles.attachment}>
                    <CreationDetailsPopup userId={card.creatorUserId}>
                      <UserAvatar withCreatorIndicator id={card.creatorUserId} />
                    </CreationDetailsPopup>
                  </span>
                </div>
              )}
              {userIds.length > 0 && (
                <div className={styles.attachments}>
                  <div className={styles.text}>
                    {t('common.members', {
                      context: 'title',
                    })}
                  </div>
                  {userIds.map((userId) => (
                    <span key={userId} className={styles.attachment}>
                      {canUseMembers ? (
                        <BoardMembershipsPopup
                          currentUserIds={userIds}
                          onUserSelect={handleUserSelect}
                          onUserDeselect={handleUserDeselect}
                        >
                          <UserAvatar id={userId} />
                        </BoardMembershipsPopup>
                      ) : (
                        <UserAvatar id={userId} />
                      )}
                    </span>
                  ))}
                  {canUseMembers && (
                    <BoardMembershipsPopup
                      currentUserIds={userIds}
                      onUserSelect={handleUserSelect}
                      onUserDeselect={handleUserDeselect}
                    >
                      <button
                        type="button"
                        className={classNames(styles.attachment, styles.dueDate)}
                      >
                        <Icon name="add" size="small" className={styles.addAttachment} />
                      </button>
                    </BoardMembershipsPopup>
                  )}
                </div>
              )}
              {labelIds.length > 0 && (
                <div className={styles.attachments}>
                  <div className={styles.text}>
                    {t('common.labels', {
                      context: 'title',
                    })}
                  </div>
                  {labelIds.map((labelId) => (
                    <span key={labelId} className={styles.attachment}>
                      {canUseLabels ? (
                        <LabelsPopup
                          currentIds={labelIds}
                          cardId={card.id}
                          onSelect={handleLabelSelect}
                          onDeselect={handleLabelDeselect}
                        >
                          <LabelChip id={labelId} />
                        </LabelsPopup>
                      ) : (
                        <LabelChip id={labelId} />
                      )}
                    </span>
                  ))}
                  {canUseLabels && (
                    <LabelsPopup
                      currentIds={labelIds}
                      cardId={card.id}
                      onSelect={handleLabelSelect}
                      onDeselect={handleLabelDeselect}
                    >
                      <button
                        type="button"
                        className={classNames(styles.attachment, styles.dueDate)}
                      >
                        <Icon name="add" size="small" className={styles.addAttachment} />
                      </button>
                    </LabelsPopup>
                  )}
                </div>
              )}
              {card.startDate && (
                <div className={styles.attachments}>
                  <div className={styles.text}>
                    {t('common.startDate', {
                      context: 'title',
                    })}
                  </div>
                  <span className={classNames(styles.attachment, styles.attachmentDueDate)}>
                    {canEditStartDate ? (
                      <EditStartDatePopup cardId={card.id}>
                        <StartDateChip value={card.startDate} />
                      </EditStartDatePopup>
                    ) : (
                      <StartDateChip value={card.startDate} />
                    )}
                  </span>
                </div>
              )}
              {card.dueDate && (
                <div className={styles.attachments}>
                  <div className={styles.text}>
                    {t('common.dueDate', {
                      context: 'title',
                    })}
                  </div>
                  <span className={classNames(styles.attachment, styles.attachmentDueDate)}>
                    {canEditDueDate ? (
                      <>
                        {!card.isClosed && (
                          <Checkbox
                            checked={card.isDueCompleted}
                            disabled={!canEditDueDate}
                            onChange={handleDueCompletionChange}
                          />
                        )}
                        <EditDueDatePopup cardId={card.id}>
                          <DueDateChip
                            withStatusIcon
                            value={card.dueDate}
                            isCompleted={card.isDueCompleted}
                            withStatus={!card.isClosed}
                          />
                        </EditDueDatePopup>
                      </>
                    ) : (
                      <DueDateChip
                        withStatusIcon
                        value={card.dueDate}
                        isCompleted={card.isDueCompleted}
                        withStatus={!card.isClosed}
                      />
                    )}
                  </span>
                </div>
              )}
              {card.stopwatch && (
                <div className={styles.attachments}>
                  <div className={styles.text}>
                    {t('common.stopwatch', {
                      context: 'title',
                    })}
                  </div>
                  <span className={styles.attachment}>
                    {canEditStopwatch ? (
                      <EditStopwatchPopup cardId={card.id}>
                        <StopwatchChip value={card.stopwatch} />
                      </EditStopwatchPopup>
                    ) : (
                      <StopwatchChip value={card.stopwatch} />
                    )}
                  </span>
                  {canEditStopwatch && (
                    <button
                      type="button"
                      className={classNames(styles.attachment, styles.dueDate)}
                      onClick={handleToggleStopwatchClick}
                    >
                      <Icon
                        name={card.stopwatch.startedAt ? 'pause' : 'play'}
                        size="small"
                        className={styles.addAttachment}
                      />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          {(card.description || canEditDescription) && (
            <div className={classNames(styles.contentModule, styles.contentModuleDescription)}>
              <div className={styles.moduleWrapper}>
                <Icon name="align left" className={styles.moduleIcon} />
                <div className={styles.moduleHeader}>
                  {t('common.description')}
                  {canEditDescription && !isEditDescriptionOpened && descriptionDraft && (
                    <span className={styles.draftChip}>{t('common.unsavedChanges')}</span>
                  )}
                </div>
                {canEditDescription && (
                  <>
                    {isEditDescriptionOpened && (
                      <EditMarkdown
                        defaultValue={card.description}
                        draftValue={descriptionDraft}
                        placeholder="common.enterDescription"
                        onUpdate={handleDescriptionUpdate}
                        onClose={handleEditDescriptionClose}
                      />
                    )}
                    {!isEditDescriptionOpened &&
                      (card.description ? (
                        /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                                    jsx-a11y/no-static-element-interactions */
                        <div className={styles.cursorPointer} onClick={handleEditDescriptionClick}>
                          <Button className={styles.editButton}>
                            <Icon fitted name="pencil" size="small" />
                          </Button>
                          <ExpandableMarkdown>{card.description}</ExpandableMarkdown>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className={styles.descriptionButton}
                          onClick={handleEditDescriptionClick}
                        >
                          <span className={styles.descriptionButtonText}>
                            {t('action.addMoreDetailedDescription')}
                          </span>
                        </button>
                      ))}
                  </>
                )}
                {!canEditDescription && <ExpandableMarkdown>{card.description}</ExpandableMarkdown>}
              </div>
            </div>
          )}
          <CustomFieldGroups />
          <TaskLists />
          <div className={styles.contentModule}>
            <div className={styles.moduleWrapper}>
              <Icon name="tasks" className={styles.moduleIcon} />
              <div className={styles.moduleHeader}>{t('common.subTasks')}</div>
              <div className={styles.childTasksSection}>
                {childCards && childCards.length > 0 && (
                  <>
                    <div className={styles.tableHeader}>
                      <div className={styles.tableHeaderCell}>{t('common.taskName')}</div>
                      <div className={styles.tableHeaderCell}>{t('common.list')}</div>
                      <div className={styles.tableHeaderCell}>{t('common.action')}</div>
                    </div>

                    <div className={styles.tableBody}>
                      {paginatedChildCards.map((childCard) => {
                        const childCardList = childCardLists[childCard.id];

                        return (
                          <div
                            key={childCard.id}
                            className={styles.tableRow}
                            onClick={() => handleChildCardClick(childCard.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleChildCardClick(childCard.id);
                              }
                            }}
                          >
                            <div className={styles.tableCell}>
                              <Icon name="tasks" className={styles.taskIcon} />
                              <span className={styles.taskName}>{childCard.name}</span>
                            </div>
                            <div className={styles.tableCell}>
                              {canUseLists ? (
                                <Dropdown
                                  value={childCard.listId}
                                  options={availableLists.map((availableList) => ({
                                    key: availableList.id,
                                    value: availableList.id,
                                    text: availableList.name,
                                  }))}
                                  onChange={(e, { value }) => {
                                    e.stopPropagation();
                                    handleChildCardListChange(childCard.id, value);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  selection
                                  compact
                                  className={styles.listDropdown}
                                />
                              ) : (
                                <span className={styles.listName}>
                                  {childCardList?.name || '-'}
                                </span>
                              )}
                            </div>
                            <div className={styles.tableCell}>
                              <span
                                className={classNames(styles.statusBadge, {
                                  [styles.statusCompleted]: childCard.isCompleted,
                                  [styles.statusOpen]: !childCard.isCompleted,
                                })}
                              >
                                {childCard.isCompleted ? t('common.completed') : t('common.open')}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {totalPages > 1 && (
                      <div className={styles.paginationContainer}>
                        <div className={styles.paginationInfo}>
                          {t('common.showing')} {(currentPage - 1) * itemsPerPage + 1}-
                          {Math.min(currentPage * itemsPerPage, childCards.length)} {t('common.of')}{' '}
                          {childCards.length}
                        </div>
                        <div className={styles.paginationControls}>
                          <button
                            className={classNames(styles.paginationButton, {
                              [styles.disabled]: currentPage === 1,
                            })}
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            type="button"
                          >
                            <Icon name="chevron left" />
                          </button>

                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              className={classNames(styles.paginationButton, styles.pageNumber, {
                                [styles.active]: page === currentPage,
                              })}
                              onClick={() => handlePageChange(page)}
                              type="button"
                            >
                              {page}
                            </button>
                          ))}

                          <button
                            className={classNames(styles.paginationButton, {
                              [styles.disabled]: currentPage === totalPages,
                            })}
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            type="button"
                          >
                            <Icon name="chevron right" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {isCreatingSubTask ? (
                  <div className={styles.inlineCreateRow}>
                    <Icon name="tasks" className={styles.taskIcon} />
                    <input
                      ref={inlineInputRef}
                      type="text"
                      className={styles.inlineInput}
                      placeholder={t('common.enterSubTaskName')}
                      value={newSubTaskName}
                      onChange={handleNewSubTaskNameChange}
                      onKeyDown={handleSubTaskKeyDown}
                      onBlur={handleCancelInlineSubTask}
                    />
                    <div className={styles.inlineActions}>
                      <Button
                        size="tiny"
                        primary
                        content={t('action.create')}
                        onClick={handleCreateInlineSubTask}
                        disabled={!newSubTaskName.trim()}
                        onMouseDown={(e) => e.preventDefault()}
                      />
                      <Button
                        size="tiny"
                        content={t('action.cancel')}
                        onClick={handleCancelInlineSubTask}
                        onMouseDown={(e) => e.preventDefault()}
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    className={styles.addSubTaskRow}
                    onClick={handleAddSubTaskClick}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleAddSubTaskClick();
                      }
                    }}
                  >
                    <Icon name="plus" className={styles.addIcon} />
                    <span>{t('action.addSubTask')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {attachmentIds.length > 0 && (
            <div className={styles.contentModule}>
              <div className={styles.moduleWrapper}>
                <Icon name="attach" className={styles.moduleIcon} />
                <div className={styles.moduleHeader}>{t('common.attachments')}</div>
                <Attachments />
              </div>
            </div>
          )}
          <div className={styles.contentModule}>
            <div className={styles.moduleWrapper}>
              <Icon name="list ul" className={styles.moduleIcon} />
              <Communication />
            </div>
          </div>
        </Grid.Column>
        <Grid.Column width={4} className={styles.sidebarPadding}>
          <div className={styles.sticky}>
            {/* In the sidebar section, after the list section: */}
            <div className={styles.actions}>
              <div className={classNames(styles.attachments, styles.attachmentsList)}>
                <div className={classNames(styles.text, styles.textList)}>{t('common.list')}</div>
                {canUseLists ? (
                  <ListsPopup currentId={list.id} onSelect={handleListSelect}>
                    <button type="button" className={styles.listButton}>
                      <span className={classNames(styles.list, styles.listHoverable)}>
                        <Icon name="columns" size="small" className={styles.listIcon} />
                        <span className={styles.hidable}>
                          {list.name || t(`common.${list.type}`)}
                        </span>
                      </span>
                    </button>
                  </ListsPopup>
                ) : (
                  <span className={styles.list}>
                    <Icon name="columns" size="small" className={styles.listIcon} />
                    <span className={styles.hidable}>{list.name || t(`common.${list.type}`)}</span>
                  </span>
                )}
              </div>
              {card.type === CardTypes.PROJECT && (
                <div className={classNames(styles.attachments, styles.attachmentsList)}>
                  <div className={classNames(styles.text, styles.textList)}>
                    {parentCard && parentCard.type === CardTypes.PROJECT
                      ? t('common.parentTask')
                      : t('common.story')}
                  </div>
                  {parentCard ? (
                    <div className={styles.storyContainer} title={parentCard.name}>
                      <span className={styles.list}>
                        <Icon
                          name={
                            parentCard.type === CardTypes.PROJECT
                              ? CardTypeIcons[CardTypes.PROJECT]
                              : 'book'
                          }
                          size="small"
                          className={styles.listIcon}
                        />
                        <span className={styles.hidable}>{parentCard.name}</span>
                      </span>
                      <button
                        type="button"
                        className={styles.removeStoryButton}
                        onClick={handleRemoveParentStory}
                        title={
                          parentCard.type === CardTypes.PROJECT
                            ? t('action.removeFromTask')
                            : t('action.removeFromStory')
                        }
                      >
                        <Icon name="times" size="small" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <StoriesPopup onSelect={handleStorySelect}>
                        <button type="button" className={styles.listButton}>
                          <span className={classNames(styles.list, styles.listHoverable)}>
                            <Icon name="book" size="small" className={styles.listIcon} />
                            <span className={styles.hidable}>{t('action.addToStory')}</span>
                          </span>
                        </button>
                      </StoriesPopup>
                      <SubTasksPopup currentCardId={card.id} onSelect={handleTaskSelect}>
                        <button type="button" className={styles.listButton}>
                          <span className={classNames(styles.list, styles.listHoverable)}>
                            <Icon
                              name={CardTypeIcons[CardTypes.PROJECT]}
                              size="small"
                              className={styles.listIcon}
                            />
                            <span className={styles.hidable}>{t('action.addToTask')}</span>
                          </span>
                        </button>
                      </SubTasksPopup>
                    </>
                  )}
                </div>
              )}
            </div>
            {(canEditStartDate ||
              canEditDueDate ||
              canEditStopwatch ||
              canUseMembers ||
              canUseLabels ||
              canAddTaskList ||
              canAddAttachment ||
              canAddCustomFieldGroup) && (
              <div className={styles.actions}>
                <span className={styles.actionsTitle}>{t('action.addToCard')}</span>
                {canUseMembers && (
                  <BoardMembershipsPopup
                    currentUserIds={userIds}
                    onUserSelect={handleUserSelect}
                    onUserDeselect={handleUserDeselect}
                  >
                    <Button fluid className={classNames(styles.actionButton, styles.hidable)}>
                      <Icon name="user outline" className={styles.actionIcon} />
                      {t('common.members')}
                    </Button>
                  </BoardMembershipsPopup>
                )}
                {canUseLabels && (
                  <LabelsPopup
                    currentIds={labelIds}
                    cardId={card.id}
                    onSelect={handleLabelSelect}
                    onDeselect={handleLabelDeselect}
                  >
                    <Button fluid className={classNames(styles.actionButton, styles.hidable)}>
                      <Icon name="bookmark outline" className={styles.actionIcon} />
                      {t('common.labels')}
                    </Button>
                  </LabelsPopup>
                )}
                {canEditStartDate && (
                  <EditStartDatePopup cardId={card.id}>
                    <Button fluid className={classNames(styles.actionButton, styles.hidable)}>
                      <Icon name="calendar outline" className={styles.actionIcon} />
                      {t('common.startDate', {
                        context: 'title',
                      })}
                    </Button>
                  </EditStartDatePopup>
                )}
                {canEditDueDate && (
                  <EditDueDatePopup cardId={card.id}>
                    <Button fluid className={classNames(styles.actionButton, styles.hidable)}>
                      <Icon name="calendar check outline" className={styles.actionIcon} />
                      {t('common.dueDate', {
                        context: 'title',
                      })}
                    </Button>
                  </EditDueDatePopup>
                )}
                {canEditStopwatch && (
                  <EditStopwatchPopup cardId={card.id}>
                    <Button fluid className={classNames(styles.actionButton, styles.hidable)}>
                      <Icon name="clock outline" className={styles.actionIcon} />
                      {t('common.stopwatch')}
                    </Button>
                  </EditStopwatchPopup>
                )}
                {canAddTaskList && (
                  <AddTaskListPopup>
                    <Button fluid className={classNames(styles.actionButton, styles.hidable)}>
                      <Icon name="check square outline" className={styles.actionIcon} />
                      {t('common.taskList', {
                        context: 'title',
                      })}
                    </Button>
                  </AddTaskListPopup>
                )}
                {canAddAttachment && (
                  <AddAttachmentPopup>
                    <Button fluid className={classNames(styles.actionButton, styles.hidable)}>
                      <Icon name="attach" className={styles.actionIcon} />
                      {t('common.attachment')}
                    </Button>
                  </AddAttachmentPopup>
                )}
                {canAddCustomFieldGroup && (
                  <AddCustomFieldGroupPopup onCreate={handleCustomFieldGroupCreate}>
                    <Button fluid className={classNames(styles.actionButton, styles.hidable)}>
                      <Icon name="sticky note outline" className={styles.actionIcon} />
                      {t('common.customField', {
                        context: 'title',
                      })}
                    </Button>
                  </AddCustomFieldGroupPopup>
                )}
              </div>
            )}
            {((!board.limitCardTypesToDefaultOne && canEditType) ||
              canSubscribe ||
              canJoin ||
              canDuplicate ||
              canMove ||
              (canRestore && (isInArchiveList || isInTrashList)) ||
              (canArchive && !isInArchiveList) ||
              canDelete) && (
              <div className={styles.actions}>
                <span className={styles.actionsTitle}>{t('common.actions')}</span>
                {canJoin && (
                  <Button
                    fluid
                    className={classNames(styles.actionButton, styles.hidable)}
                    onClick={handleToggleJointClick}
                  >
                    <Icon
                      name={isJoined ? 'flag outline' : 'flag checkered'}
                      className={styles.actionIcon}
                    />
                    {isJoined ? t('action.leave') : t('action.join')}
                  </Button>
                )}
                {canSubscribe && (
                  <Button
                    fluid
                    disabled={board.isSubscribed}
                    className={classNames(styles.actionButton, styles.hidable)}
                    onClick={handleToggleSubscriptionClick}
                  >
                    {board.isSubscribed ? (
                      <>
                        <Icon name="bell slash outline" className={styles.actionIcon} />
                        {t('common.boardSubscribed')}
                      </>
                    ) : (
                      <>
                        <Icon
                          name={card.isSubscribed ? 'bell slash outline' : 'bell outline'}
                          className={styles.actionIcon}
                        />
                        {card.isSubscribed ? t('action.unsubscribe') : t('action.subscribe')}
                      </>
                    )}
                  </Button>
                )}
                {canRestore && (isInArchiveList || isInTrashList) && (
                  <Button
                    fluid
                    disabled={!prevList}
                    className={classNames(styles.actionButton, styles.hidable)}
                    onClick={handleRestoreClick}
                  >
                    <Icon name="undo alternate" className={styles.actionIcon} />
                    {prevList
                      ? t('action.restoreToList', {
                          list: prevList.name || t(`common.${prevList.type}`),
                        })
                      : t('common.selectListToRestoreThisCard')}
                  </Button>
                )}
                {canArchive && !isInArchiveList && (
                  <ConfirmationPopup
                    title="common.archiveCard"
                    content="common.areYouSureYouWantToArchiveThisCard"
                    buttonContent="action.archiveCard"
                    onConfirm={handleArchiveConfirm}
                  >
                    <Button fluid className={classNames(styles.actionButton, styles.hidable)}>
                      <Icon name="folder open outline" className={styles.actionIcon} />
                      {t('action.archive')}
                    </Button>
                  </ConfirmationPopup>
                )}
                {canDelete && (
                  <ConfirmationPopup
                    title={isInTrashList ? 'common.deleteCardForever' : 'common.deleteCard'}
                    content={
                      isInTrashList
                        ? 'common.areYouSureYouWantToDeleteThisCardForever'
                        : 'common.areYouSureYouWantToDeleteThisCard'
                    }
                    buttonContent={isInTrashList ? 'action.deleteCardForever' : 'action.deleteCard'}
                    onConfirm={handleDeleteConfirm}
                  >
                    <Button fluid className={classNames(styles.actionButton, styles.hidable)}>
                      <Icon name="trash alternate outline" className={styles.actionIcon} />
                      {isInTrashList
                        ? t('action.deleteForever', {
                            context: 'title',
                          })
                        : t('action.delete')}
                    </Button>
                  </ConfirmationPopup>
                )}
                {((!board.limitCardTypesToDefaultOne && canEditType) ||
                  canDuplicate ||
                  canMove) && (
                  <MoreActionsPopup>
                    <Button fluid className={classNames(styles.moreActionsButton, styles.hidable)}>
                      <Icon name="ellipsis horizontal" className={styles.moreActionsButtonIcon} />
                      {t('common.moreActions')}
                    </Button>
                  </MoreActionsPopup>
                )}
              </div>
            )}
          </div>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
});

export default ProjectContent;
