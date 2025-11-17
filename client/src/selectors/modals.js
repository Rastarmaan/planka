/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import { UserRoles } from '../constants/Enums';
import ModalTypes from '../constants/ModalTypes';
import orm from '../orm';
import { isUserAdminOrProjectOwner } from '../utils/record-helpers';
import { selectPath } from './router';
import { selectCurrentUserId } from './users';

export const selectCurrentModal = ({ core: { modal } }) => modal;

export const isCurrentModalAvailableForCurrentUser = createSelector(
  orm,
  selectCurrentModal,
  (state) => selectCurrentUserId(state),
  (state) => selectPath(state).projectId,
  ({ User, Project, Board }, currentModal, currentUserId, currentProjectId) => {
    if (currentModal) {
      const currentUserModel = User.withId(currentUserId);

      switch (currentModal.type) {
        case ModalTypes.ADMINISTRATION:
          return currentUserModel.role === UserRoles.ADMIN;
        case ModalTypes.ADD_PROJECT:
          return isUserAdminOrProjectOwner(currentUserModel);
        case ModalTypes.PROJECT_SETTINGS: {
          const projectModel = Project.withId(currentProjectId);
          if (!projectModel) {
            return false;
          }

          return (
            isUserAdminOrProjectOwner(currentUserModel) ||
            projectModel.isExternalAccessibleForUser(currentUserModel)
          );
        }
        case ModalTypes.BOARD_SETTINGS: {
          const boardModel = Board.withId(currentModal.params.id);

          if (!boardModel || !boardModel.isAvailableForUser(currentUserModel)) {
            return false;
          }

          return (
            isUserAdminOrProjectOwner(currentUserModel) ||
            boardModel.project.hasManagerWithUserId(currentUserId)
          );
        }
        case ModalTypes.BOARD_ACTIVITIES: {
          const boardModel = Board.withId(currentModal.params.id);
          return !!boardModel && boardModel.isAvailableForUser(currentUserModel);
        }
        default:
          return true;
      }
    }

    return true;
  },
);

export default {
  selectCurrentModal,
  isCurrentModalAvailableForCurrentUser,
};
