/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { eventChannel } from 'redux-saga';
import { all, call, cancelled, put, take, takeEvery } from 'redux-saga/effects';

import actions from '../../../actions';
import api, { socket } from '../../../api';
import EntryActionTypes from '../../../constants/EntryActionTypes';
import entryActions from '../../../entry-actions';
import services from '../services';

const createSocketEventsChannel = () =>
  eventChannel((emit) => {
    const handleDisconnect = () => {
      emit(entryActions.handleSocketDisconnect());
    };

    const handleReconnect = () => {
      emit(entryActions.handleSocketReconnect());
    };

    const handleLogout = () => {
      emit(entryActions.logout(false));
    };

    const handleConfigUpdate = ({ item }) => {
      emit(entryActions.handleConfigUpdate(item));
    };

    const handleUserCreate = ({ item }) => {
      emit(entryActions.handleUserCreate(item));
    };

    const handleUserUpdate = ({ item }) => {
      emit(entryActions.handleUserUpdate(item));
    };

    const handleUserDelete = ({ item }) => {
      emit(entryActions.handleUserDelete(item));
    };

    const handleProjectCreate = ({ item, included }) => {
      emit(entryActions.handleProjectCreate(item, included));
    };

    const handleProjectUpdate = ({ item }) => {
      emit(entryActions.handleProjectUpdate(item));
    };

    const handleProjectDelete = ({ item }) => {
      emit(entryActions.handleProjectDelete(item));
    };

    const handleProjectCategoryCreate = ({ item }) => {
      emit(actions.handleProjectCategoryCreate(item));
    };

    const handleProjectCategoryUpdate = ({ item }) => {
      emit(actions.handleProjectCategoryUpdate(item));
    };

    const handleProjectCategoryDelete = ({ item }) => {
      emit(actions.handleProjectCategoryDelete(item));
    };

    const handleProjectHistoryCreate = ({ item }) => {
      emit(entryActions.handleProjectHistoryCreate(item));
    };

    const handleProjectHistoryUpdate = ({ item }) => {
      emit(entryActions.handleProjectHistoryUpdate(item));
    };

    const handleProjectHistoryDelete = ({ item }) => {
      emit(entryActions.handleProjectHistoryDelete(item));
    };

    const handleProjectManagerCreate = ({ item, included: { users } }) => {
      emit(entryActions.handleProjectManagerCreate(item, users));
    };

    const handleProjectManagerDelete = ({ item }) => {
      emit(entryActions.handleProjectManagerDelete(item));
    };

    const handleBackgroundImageCreate = ({ item, requestId }) => {
      emit(entryActions.handleBackgroundImageCreate(item, requestId));
    };

    const handleBackgroundImageDelete = ({ item }) => {
      emit(entryActions.handleBackgroundImageDelete(item));
    };

    const handleBaseCustomFieldGroupCreate = ({ item }) => {
      emit(entryActions.handleBaseCustomFieldGroupCreate(item));
    };

    const handleBaseCustomFieldGroupUpdate = ({ item }) => {
      emit(entryActions.handleBaseCustomFieldGroupUpdate(item));
    };

    const handleBaseCustomFieldGroupDelete = ({ item }) => {
      emit(entryActions.handleBaseCustomFieldGroupDelete(item));
    };

    const handleBoardCreate = ({ item, included: { boardMemberships }, requestId }) => {
      emit(entryActions.handleBoardCreate(item, boardMemberships, requestId));
    };

    const handleImportProgress = ({ boardId, stage, message, current, total }) => {
      // eslint-disable-next-line no-console
      console.log(`[Trello Import] ${message} (${current}/${total})`);
      emit(entryActions.handleImportProgress(boardId, stage, message, current, total));
    };

    const handleBoardUpdate = ({ item }) => {
      emit(entryActions.handleBoardUpdate(item));
    };

    const handleBoardDelete = ({ item }) => {
      emit(entryActions.handleBoardDelete(item));
    };

    const handleBoardMembershipCreate = ({ item, included: { users } = {} }) => {
      emit(entryActions.handleBoardMembershipCreate(item, users));
    };

    const handleBoardMembershipUpdate = ({ item }) => {
      emit(entryActions.handleBoardMembershipUpdate(item));
    };

    const handleBoardMembershipDelete = ({ item }) => {
      emit(entryActions.handleBoardMembershipDelete(item));
    };

    const handleTeamCreate = ({ item }) => {
      emit(entryActions.handleTeamCreate(item));
    };

    const handleTeamUpdate = ({ item }) => {
      emit(entryActions.handleTeamUpdate(item));
    };

    const handleTeamDelete = ({ item }) => {
      emit(entryActions.handleTeamDelete(item));
    };

    const handleBoardTeamCreate = ({ item }) => {
      emit(entryActions.handleBoardTeamCreate(item));
    };

    const handleBoardTeamUpdate = ({ item }) => {
      emit(entryActions.handleBoardTeamUpdate(item));
    };

    const handleBoardTeamDelete = ({ item, included }) => {
      emit(entryActions.handleBoardTeamDelete(item, included?.boardMemberships));
    };

    const handleBoardReleaseCreate = ({ item }) => {
      emit(actions.handleBoardReleaseCreate(item));
    };

    const handleBoardReleaseUpdate = ({ item, releaseCards }) => {
      emit(actions.handleBoardReleaseUpdate(item, releaseCards));
    };

    const handleBoardReleaseDelete = ({ item }) => {
      emit(actions.handleBoardReleaseDelete(item));
    };

    const handleReleaseCardCreate = ({ item }) => {
      emit(actions.handleReleaseCardCreate(item));
    };

    const handleReleaseCardDelete = ({ item }) => {
      emit(actions.handleReleaseCardDelete(item));
    };

    const handleListCreate = ({ item }) => {
      emit(entryActions.handleListCreate(item));
    };

    const handleListUpdate = ({ item }) => {
      emit(entryActions.handleListUpdate(item));
    };

    const handleListClear = ({ item }) => {
      emit(entryActions.handleListClear(item));
    };

    const handleListDelete = api.makeHandleListDelete(({ item, included: { cards } }) => {
      emit(entryActions.handleListDelete(item, cards));
    });

    const handleLabelCreate = ({ item }) => {
      emit(entryActions.handleLabelCreate(item));
    };

    const handleLabelUpdate = ({ item }) => {
      emit(entryActions.handleLabelUpdate(item));
    };

    const handleLabelDelete = ({ item }) => {
      emit(entryActions.handleLabelDelete(item));
    };

    const handleGlobalLabelCreate = ({ item }) => {
      emit(entryActions.handleGlobalLabelCreate(item));
    };

    const handleGlobalLabelUpdate = ({ item }) => {
      emit(entryActions.handleGlobalLabelUpdate(item));
    };

    const handleGlobalLabelDelete = ({ item }) => {
      emit(entryActions.handleGlobalLabelDelete(item));
    };

    const handleCardsUpdate = api.makeHandleCardsUpdate(
      ({ items, included: { activities } = {} }) => {
        emit(entryActions.handleCardsUpdate(items, activities));
      },
    );

    const handleCardCreate = api.makeHandleCardCreate(({ item }) => {
      emit(entryActions.handleCardCreate(item));
    });

    const handleCardUpdate = api.makeHandleCardUpdate(({ item }) => {
      emit(entryActions.handleCardUpdate(item));
    });

    const handleCardDelete = api.makeHandleCardDelete(({ item }) => {
      emit(entryActions.handleCardDelete(item));
    });

    const handleUserToCardAdd = ({ item }) => {
      emit(entryActions.handleUserToCardAdd(item));
    };

    const handleUserFromCardRemove = ({ item }) => {
      emit(entryActions.handleUserFromCardRemove(item));
    };

    const handleLabelToCardAdd = ({ item }) => {
      emit(entryActions.handleLabelToCardAdd(item));
    };

    const handleLabelFromCardRemove = ({ item }) => {
      emit(entryActions.handleLabelFromCardRemove(item));
    };

    const handleCardDependencyCreate = ({ item }) => {
      emit(entryActions.handleCardDependencyCreate(item));
    };

    const handleCardDependencyDelete = ({ item }) => {
      emit(entryActions.handleCardDependencyDelete(item));
    };

    const handleTaskListCreate = ({ item }) => {
      emit(entryActions.handleTaskListCreate(item));
    };

    const handleTaskListUpdate = ({ item }) => {
      emit(entryActions.handleTaskListUpdate(item));
    };

    const handleTaskListDelete = ({ item }) => {
      emit(entryActions.handleTaskListDelete(item));
    };

    const handleTaskCreate = ({ item }) => {
      emit(entryActions.handleTaskCreate(item));
    };

    const handleTaskUpdate = ({ item }) => {
      emit(entryActions.handleTaskUpdate(item));
    };

    const handleTaskDelete = ({ item }) => {
      emit(entryActions.handleTaskDelete(item));
    };

    const handleAttachmentCreate = api.makeHandleAttachmentCreate(({ item, requestId }) => {
      emit(entryActions.handleAttachmentCreate(item, requestId));
    });

    const handleAttachmentUpdate = api.makeHandleAttachmentUpdate(({ item }) => {
      emit(entryActions.handleAttachmentUpdate(item));
    });

    const handleAttachmentDelete = api.makeHandleAttachmentDelete(({ item }) => {
      emit(entryActions.handleAttachmentDelete(item));
    });

    const handleCustomFieldGroupCreate = ({ item }) => {
      emit(entryActions.handleCustomFieldGroupCreate(item));
    };

    const handleCustomFieldGroupUpdate = ({ item }) => {
      emit(entryActions.handleCustomFieldGroupUpdate(item));
    };

    const handleCustomFieldGroupDelete = ({ item }) => {
      emit(entryActions.handleCustomFieldGroupDelete(item));
    };

    const handleCustomFieldCreate = ({ item }) => {
      emit(entryActions.handleCustomFieldCreate(item));
    };

    const handleCustomFieldUpdate = ({ item }) => {
      emit(entryActions.handleCustomFieldUpdate(item));
    };

    const handleCustomFieldDelete = ({ item }) => {
      emit(entryActions.handleCustomFieldDelete(item));
    };

    const handleCustomFieldValueUpdate = ({ item }) => {
      emit(entryActions.handleCustomFieldValueUpdate(item));
    };

    const handleCustomFieldValueDelete = ({ item }) => {
      emit(entryActions.handleCustomFieldValueDelete(item));
    };

    const handleCommentCreate = api.makeHandleCommentCreate(({ item, included: { users } }) => {
      emit(entryActions.handleCommentCreate(item, users));
    });

    const handleCommentUpdate = api.makeHandleCommentUpdate(({ item }) => {
      emit(entryActions.handleCommentUpdate(item));
    });

    const handleCommentDelete = api.makeHandleCommentDelete(({ item }) => {
      emit(entryActions.handleCommentDelete(item));
    });

    const handleActivityCreate = api.makeHandleActivityCreate(({ item }) => {
      emit(entryActions.handleActivityCreate(item));
    });

    const handleNotificationCreate = api.makeHandleNotificationCreate(
      ({ item, included: { users } }) => {
        emit(entryActions.handleNotificationCreate(item, users));
      },
    );

    const handleNotificationUpdate = api.makeHandleNotificationUpdate(({ item }) => {
      emit(entryActions.handleNotificationDelete(item));
    });

    const handleNotificationServiceCreate = ({ item }) => {
      emit(entryActions.handleNotificationServiceCreate(item));
    };

    const handleNotificationServiceUpdate = ({ item }) => {
      emit(entryActions.handleNotificationServiceUpdate(item));
    };

    const handleNotificationServiceDelete = ({ item }) => {
      emit(entryActions.handleNotificationServiceDelete(item));
    };

    const handleSpaceCreate = ({ item }) => {
      emit(entryActions.handleSpaceCreate(item));
    };

    const handleSpaceUpdate = ({ item }) => {
      emit(entryActions.handleSpaceUpdate(item));
    };

    const handleSpaceDelete = ({ item }) => {
      emit(entryActions.handleSpaceDelete(item));
    };

    const handleFolderCreate = ({ item }) => {
      emit(entryActions.handleFolderCreate(item));
    };

    const handleFolderUpdate = ({ item }) => {
      emit(entryActions.handleFolderUpdate(item));
    };

    const handleFolderDelete = ({ item }) => {
      emit(entryActions.handleFolderDelete(item));
    };

    const handleFileCreate = ({ item }) => {
      emit(entryActions.handleFileCreate(item));
    };

    const handleFileUpdate = ({ item }) => {
      emit(entryActions.handleFileUpdate(item));
    };

    const handleFileDelete = ({ item }) => {
      emit(entryActions.handleFileDelete(item));
    };

    const handlePermissionCreate = ({ item }) => {
      emit(entryActions.handlePermissionCreate(item));
    };

    const handlePermissionDelete = ({ item }) => {
      emit(entryActions.handlePermissionDelete(item));
    };

    const handleReportCreate = ({ item, reportPhases, reportPhaseMemberships }) => {
      emit(entryActions.handleReportCreate(item, reportPhases, reportPhaseMemberships));
    };

    const handleReportUpdate = ({ item }) => {
      emit(entryActions.handleReportUpdate(item));
    };

    const handleReportDelete = ({ item }) => {
      emit(entryActions.handleReportDelete(item));
    };

    const handleReportPhaseCreate = ({ item, reportPhaseMemberships }) => {
      emit(entryActions.handleReportPhaseCreate(item, reportPhaseMemberships));
    };

    const handleReportPhaseUpdate = ({ item, reportPhaseMemberships }) => {
      emit(entryActions.handleReportPhaseUpdate(item, reportPhaseMemberships));
    };

    const handleReportPhaseDelete = ({ item }) => {
      emit(entryActions.handleReportPhaseDelete(item));
    };

    const handleProjectProfileCreate = ({ item, sections, fields }) => {
      emit(entryActions.handleProjectProfileCreate(item, sections, fields));
    };

    const handleProjectProfileUpdate = ({ item }) => {
      emit(entryActions.handleProjectProfileUpdate(item));
    };

    const handleProjectProfileDelete = ({ item }) => {
      emit(entryActions.handleProjectProfileDelete(item));
    };

    const handleProjectProfileSectionCreate = ({ item, fields }) => {
      emit(entryActions.handleProjectProfileSectionCreate(item, fields));
    };

    const handleProjectProfileSectionUpdate = ({ item }) => {
      emit(entryActions.handleProjectProfileSectionUpdate(item));
    };

    const handleProjectProfileSectionDelete = ({ item }) => {
      emit(entryActions.handleProjectProfileSectionDelete(item));
    };

    const handleProjectProfileFieldCreate = ({ item }) => {
      emit(entryActions.handleProjectProfileFieldCreate(item));
    };

    const handleProjectProfileFieldUpdate = ({ item }) => {
      emit(entryActions.handleProjectProfileFieldUpdate(item));
    };

    const handleProjectProfileFieldDelete = ({ item }) => {
      emit(entryActions.handleProjectProfileFieldDelete(item));
    };

    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect', handleReconnect);

    socket.on('logout', handleLogout);

    socket.on('configUpdate', handleConfigUpdate);

    socket.on('userCreate', handleUserCreate);
    socket.on('userUpdate', handleUserUpdate);
    socket.on('userDelete', handleUserDelete);

    socket.on('projectCreate', handleProjectCreate);
    socket.on('projectUpdate', handleProjectUpdate);
    socket.on('projectDelete', handleProjectDelete);

    socket.on('projectCategoryCreate', handleProjectCategoryCreate);
    socket.on('projectCategoryUpdate', handleProjectCategoryUpdate);
    socket.on('projectCategoryDelete', handleProjectCategoryDelete);

    socket.on('projectManagerCreate', handleProjectManagerCreate);
    socket.on('projectManagerDelete', handleProjectManagerDelete);

    socket.on('projectHistoryCreate', handleProjectHistoryCreate);
    socket.on('projectHistoryUpdate', handleProjectHistoryUpdate);
    socket.on('projectHistoryDelete', handleProjectHistoryDelete);

    socket.on('backgroundImageCreate', handleBackgroundImageCreate);
    socket.on('backgroundImageDelete', handleBackgroundImageDelete);

    socket.on('baseCustomFieldGroupCreate', handleBaseCustomFieldGroupCreate);
    socket.on('baseCustomFieldGroupUpdate', handleBaseCustomFieldGroupUpdate);
    socket.on('baseCustomFieldGroupDelete', handleBaseCustomFieldGroupDelete);

    socket.on('boardCreate', handleBoardCreate);
    socket.on('importProgress', handleImportProgress);
    socket.on('boardUpdate', handleBoardUpdate);
    socket.on('boardDelete', handleBoardDelete);

    socket.on('boardMembershipCreate', handleBoardMembershipCreate);
    socket.on('boardMembershipUpdate', handleBoardMembershipUpdate);
    socket.on('boardMembershipDelete', handleBoardMembershipDelete);

    socket.on('teamCreate', handleTeamCreate);
    socket.on('teamUpdate', handleTeamUpdate);
    socket.on('teamDelete', handleTeamDelete);

    socket.on('boardTeamCreate', handleBoardTeamCreate);
    socket.on('boardTeamUpdate', handleBoardTeamUpdate);
    socket.on('boardTeamDelete', handleBoardTeamDelete);

    socket.on('boardReleaseCreate', handleBoardReleaseCreate);
    socket.on('boardReleaseUpdate', handleBoardReleaseUpdate);
    socket.on('boardReleaseDelete', handleBoardReleaseDelete);

    socket.on('releaseCardCreate', handleReleaseCardCreate);
    socket.on('releaseCardDelete', handleReleaseCardDelete);

    socket.on('listCreate', handleListCreate);
    socket.on('listUpdate', handleListUpdate);
    socket.on('listClear', handleListClear);
    socket.on('listDelete', handleListDelete);

    socket.on('labelCreate', handleLabelCreate);
    socket.on('labelUpdate', handleLabelUpdate);
    socket.on('labelDelete', handleLabelDelete);

    socket.on('globalLabelCreate', handleGlobalLabelCreate);
    socket.on('globalLabelUpdate', handleGlobalLabelUpdate);
    socket.on('globalLabelDelete', handleGlobalLabelDelete);

    socket.on('cardsUpdate', handleCardsUpdate);
    socket.on('cardCreate', handleCardCreate);
    socket.on('cardUpdate', handleCardUpdate);
    socket.on('cardDelete', handleCardDelete);

    socket.on('cardMembershipCreate', handleUserToCardAdd);
    socket.on('cardMembershipDelete', handleUserFromCardRemove);

    socket.on('cardLabelCreate', handleLabelToCardAdd);
    socket.on('cardLabelDelete', handleLabelFromCardRemove);

    socket.on('cardDependencyCreate', handleCardDependencyCreate);
    socket.on('cardDependencyDelete', handleCardDependencyDelete);

    socket.on('taskListCreate', handleTaskListCreate);
    socket.on('taskListUpdate', handleTaskListUpdate);
    socket.on('taskListDelete', handleTaskListDelete);

    socket.on('taskCreate', handleTaskCreate);
    socket.on('taskUpdate', handleTaskUpdate);
    socket.on('taskDelete', handleTaskDelete);

    socket.on('attachmentCreate', handleAttachmentCreate);
    socket.on('attachmentUpdate', handleAttachmentUpdate);
    socket.on('attachmentDelete', handleAttachmentDelete);

    socket.on('customFieldGroupCreate', handleCustomFieldGroupCreate);
    socket.on('customFieldGroupUpdate', handleCustomFieldGroupUpdate);
    socket.on('customFieldGroupDelete', handleCustomFieldGroupDelete);

    socket.on('customFieldCreate', handleCustomFieldCreate);
    socket.on('customFieldUpdate', handleCustomFieldUpdate);
    socket.on('customFieldDelete', handleCustomFieldDelete);

    socket.on('customFieldValueUpdate', handleCustomFieldValueUpdate);
    socket.on('customFieldValueDelete', handleCustomFieldValueDelete);

    socket.on('commentCreate', handleCommentCreate);
    socket.on('commentUpdate', handleCommentUpdate);
    socket.on('commentDelete', handleCommentDelete);

    socket.on('actionCreate', handleActivityCreate);

    socket.on('notificationCreate', handleNotificationCreate);
    socket.on('notificationUpdate', handleNotificationUpdate);

    socket.on('notificationServiceCreate', handleNotificationServiceCreate);
    socket.on('notificationServiceUpdate', handleNotificationServiceUpdate);
    socket.on('notificationServiceDelete', handleNotificationServiceDelete);

    socket.on('spaceCreate', handleSpaceCreate);
    socket.on('spaceUpdate', handleSpaceUpdate);
    socket.on('spaceDelete', handleSpaceDelete);

    socket.on('folderCreate', handleFolderCreate);
    socket.on('folderUpdate', handleFolderUpdate);
    socket.on('folderDelete', handleFolderDelete);

    socket.on('fileCreate', handleFileCreate);
    socket.on('fileUpdate', handleFileUpdate);
    socket.on('fileDelete', handleFileDelete);

    socket.on('permissionCreate', handlePermissionCreate);
    socket.on('permissionDelete', handlePermissionDelete);

    socket.on('reportCreate', handleReportCreate);
    socket.on('reportUpdate', handleReportUpdate);
    socket.on('reportDelete', handleReportDelete);

    socket.on('reportPhaseCreate', handleReportPhaseCreate);
    socket.on('reportPhaseUpdate', handleReportPhaseUpdate);
    socket.on('reportPhaseDelete', handleReportPhaseDelete);

    socket.on('projectProfileCreate', handleProjectProfileCreate);
    socket.on('projectProfileUpdate', handleProjectProfileUpdate);
    socket.on('projectProfileDelete', handleProjectProfileDelete);

    socket.on('projectProfileSectionCreate', handleProjectProfileSectionCreate);
    socket.on('projectProfileSectionUpdate', handleProjectProfileSectionUpdate);
    socket.on('projectProfileSectionDelete', handleProjectProfileSectionDelete);

    socket.on('projectProfileFieldCreate', handleProjectProfileFieldCreate);
    socket.on('projectProfileFieldUpdate', handleProjectProfileFieldUpdate);
    socket.on('projectProfileFieldDelete', handleProjectProfileFieldDelete);

    return () => {
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect', handleReconnect);

      socket.off('logout', handleLogout);

      socket.off('configUpdate', handleConfigUpdate);

      socket.off('userCreate', handleUserCreate);
      socket.off('userUpdate', handleUserUpdate);
      socket.off('userDelete', handleUserDelete);

      socket.off('projectCreate', handleProjectCreate);
      socket.off('projectUpdate', handleProjectUpdate);
      socket.off('projectDelete', handleProjectDelete);

      socket.off('projectManagerCreate', handleProjectManagerCreate);
      socket.off('projectManagerDelete', handleProjectManagerDelete);

      socket.off('projectHistoryCreate', handleProjectHistoryCreate);
      socket.off('projectHistoryUpdate', handleProjectHistoryUpdate);
      socket.off('projectHistoryDelete', handleProjectHistoryDelete);

      socket.off('backgroundImageCreate', handleBackgroundImageCreate);
      socket.off('backgroundImageDelete', handleBackgroundImageDelete);

      socket.off('baseCustomFieldGroupCreate', handleBaseCustomFieldGroupCreate);
      socket.off('baseCustomFieldGroupUpdate', handleBaseCustomFieldGroupUpdate);
      socket.off('baseCustomFieldGroupDelete', handleBaseCustomFieldGroupDelete);

      socket.off('boardCreate', handleBoardCreate);
      socket.off('importProgress', handleImportProgress);
      socket.off('boardUpdate', handleBoardUpdate);
      socket.off('boardDelete', handleBoardDelete);

      socket.off('boardMembershipCreate', handleBoardMembershipCreate);
      socket.off('boardMembershipUpdate', handleBoardMembershipUpdate);
      socket.off('boardMembershipDelete', handleBoardMembershipDelete);

      socket.off('teamCreate', handleTeamCreate);
      socket.off('teamUpdate', handleTeamUpdate);
      socket.off('teamDelete', handleTeamDelete);

      socket.off('boardTeamCreate', handleBoardTeamCreate);
      socket.off('boardTeamUpdate', handleBoardTeamUpdate);
      socket.off('boardTeamDelete', handleBoardTeamDelete);

      socket.off('boardReleaseCreate', handleBoardReleaseCreate);
      socket.off('boardReleaseUpdate', handleBoardReleaseUpdate);
      socket.off('boardReleaseDelete', handleBoardReleaseDelete);

      socket.off('releaseCardCreate', handleReleaseCardCreate);
      socket.off('releaseCardDelete', handleReleaseCardDelete);

      socket.off('listCreate', handleListCreate);
      socket.off('listUpdate', handleListUpdate);
      socket.off('listClear', handleListClear);
      socket.off('listDelete', handleListDelete);

      socket.off('labelCreate', handleLabelCreate);
      socket.off('labelUpdate', handleLabelUpdate);
      socket.off('labelDelete', handleLabelDelete);

      socket.off('globalLabelCreate', handleGlobalLabelCreate);
      socket.off('globalLabelUpdate', handleGlobalLabelUpdate);
      socket.off('globalLabelDelete', handleGlobalLabelDelete);

      socket.off('cardsUpdate', handleCardsUpdate);
      socket.off('cardCreate', handleCardCreate);
      socket.off('cardUpdate', handleCardUpdate);
      socket.off('cardDelete', handleCardDelete);

      socket.off('cardMembershipCreate', handleUserToCardAdd);
      socket.off('cardMembershipDelete', handleUserFromCardRemove);

      socket.off('cardLabelCreate', handleLabelToCardAdd);
      socket.off('cardLabelDelete', handleLabelFromCardRemove);

      socket.off('cardDependencyCreate', handleCardDependencyCreate);
      socket.off('cardDependencyDelete', handleCardDependencyDelete);

      socket.off('taskListCreate', handleTaskListCreate);
      socket.off('taskListUpdate', handleTaskListUpdate);
      socket.off('taskListDelete', handleTaskListDelete);

      socket.off('taskCreate', handleTaskCreate);
      socket.off('taskUpdate', handleTaskUpdate);
      socket.off('taskDelete', handleTaskDelete);

      socket.off('attachmentCreate', handleAttachmentCreate);
      socket.off('attachmentUpdate', handleAttachmentUpdate);
      socket.off('attachmentDelete', handleAttachmentDelete);

      socket.off('customFieldGroupCreate', handleCustomFieldGroupCreate);
      socket.off('customFieldGroupUpdate', handleCustomFieldGroupUpdate);
      socket.off('customFieldGroupDelete', handleCustomFieldGroupDelete);

      socket.off('customFieldCreate', handleCustomFieldCreate);
      socket.off('customFieldUpdate', handleCustomFieldUpdate);
      socket.off('customFieldDelete', handleCustomFieldDelete);

      socket.off('customFieldValueUpdate', handleCustomFieldValueUpdate);
      socket.off('customFieldValueDelete', handleCustomFieldValueDelete);

      socket.off('commentCreate', handleCommentCreate);
      socket.off('commentUpdate', handleCommentUpdate);
      socket.off('commentDelete', handleCommentDelete);

      socket.off('actionCreate', handleActivityCreate);

      socket.off('notificationCreate', handleNotificationCreate);
      socket.off('notificationUpdate', handleNotificationUpdate);

      socket.off('notificationServiceCreate', handleNotificationServiceCreate);
      socket.off('notificationServiceUpdate', handleNotificationServiceUpdate);
      socket.off('notificationServiceDelete', handleNotificationServiceDelete);

      socket.off('spaceCreate', handleSpaceCreate);
      socket.off('spaceUpdate', handleSpaceUpdate);
      socket.off('spaceDelete', handleSpaceDelete);

      socket.off('folderCreate', handleFolderCreate);
      socket.off('folderUpdate', handleFolderUpdate);
      socket.off('folderDelete', handleFolderDelete);

      socket.off('fileCreate', handleFileCreate);
      socket.off('fileUpdate', handleFileUpdate);
      socket.off('fileDelete', handleFileDelete);

      socket.off('permissionCreate', handlePermissionCreate);
      socket.off('permissionDelete', handlePermissionDelete);

      socket.off('reportCreate', handleReportCreate);
      socket.off('reportUpdate', handleReportUpdate);
      socket.off('reportDelete', handleReportDelete);

      socket.off('reportPhaseCreate', handleReportPhaseCreate);
      socket.off('reportPhaseUpdate', handleReportPhaseUpdate);
      socket.off('reportPhaseDelete', handleReportPhaseDelete);

      socket.off('projectProfileCreate', handleProjectProfileCreate);
      socket.off('projectProfileUpdate', handleProjectProfileUpdate);
      socket.off('projectProfileDelete', handleProjectProfileDelete);

      socket.off('projectProfileSectionCreate', handleProjectProfileSectionCreate);
      socket.off('projectProfileSectionUpdate', handleProjectProfileSectionUpdate);
      socket.off('projectProfileSectionDelete', handleProjectProfileSectionDelete);

      socket.off('projectProfileFieldCreate', handleProjectProfileFieldCreate);
      socket.off('projectProfileFieldUpdate', handleProjectProfileFieldUpdate);
      socket.off('projectProfileFieldDelete', handleProjectProfileFieldDelete);
    };
  });

export default function* socketWatchers() {
  yield all([
    yield takeEvery(EntryActionTypes.SOCKET_DISCONNECT_HANDLE, () =>
      services.handleSocketDisconnect(),
    ),
    yield takeEvery(EntryActionTypes.SOCKET_RECONNECT_HANDLE, () =>
      services.handleSocketReconnect(),
    ),
  ]);

  const socketEventsChannel = yield call(createSocketEventsChannel);

  try {
    while (true) {
      const action = yield take(socketEventsChannel);

      yield put(action);
    }
  } finally {
    if (yield cancelled()) {
      socketEventsChannel.close();
    }
  }
}
