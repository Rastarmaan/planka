/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Icon } from 'semantic-ui-react';
import { Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useSteps } from '../../../hooks';
import SelectPermissionsStep from './SelectPermissionsStep';
import ConfirmationStep from '../../common/ConfirmationStep';

import styles from './ActionsStep.module.scss';

const StepTypes = {
  EDIT_PERMISSIONS: 'EDIT_PERMISSIONS',
  DELETE: 'DELETE',
};

const TeamActionsStep = React.memo(({ boardTeamId, title, onBack, onClose }) => {
  const selectBoardTeamById = useMemo(() => selectors.makeSelectBoardTeamById(), []);

  const boardTeam = useSelector((state) => selectBoardTeamById(state, boardTeamId));

  const canEdit = useSelector(selectors.selectIsCurrentUserManagerForCurrentProject);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

  const handleRoleSelect = useCallback(
    (data) => {
      dispatch(entryActions.updateBoardTeam(boardTeamId, data));
    },
    [boardTeamId, dispatch],
  );

  const handleDeleteConfirm = useCallback(() => {
    dispatch(entryActions.deleteBoardTeam(boardTeamId));
    onClose();
  }, [boardTeamId, onClose, dispatch]);

  const handleEditPermissionsClick = useCallback(() => {
    openStep(StepTypes.EDIT_PERMISSIONS);
  }, [openStep]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  if (!boardTeam) {
    return null;
  }

  if (step) {
    switch (step.type) {
      case StepTypes.EDIT_PERMISSIONS:
        return (
          <SelectPermissionsStep
            boardMembership={boardTeam}
            title="common.editPermissions"
            buttonContent="action.save"
            onSelect={handleRoleSelect}
            onBack={handleBack}
            onClose={onClose}
          />
        );
      case StepTypes.DELETE:
        return (
          <ConfirmationStep
            title="common.removeTeam"
            content="common.areYouSureYouWantToRemoveThisTeamFromBoard"
            buttonContent="action.removeTeam"
            onConfirm={handleDeleteConfirm}
            onBack={handleBack}
          />
        );
      default:
    }

    openStep(null);
  }

  const contentNode = (
    <>
      <div className={styles.userWrapper}>
        <span className={styles.user}>
          <Icon name="users" size="large" />
        </span>
        <span className={styles.content}>
          <div className={styles.name}>{boardTeam.team?.name || t('common.unknownTeam')}</div>
          <div className={styles.username}>
            {t('common.nMembers', { count: boardTeam.team?.memberships?.length || 0 })}
          </div>
        </span>
      </div>
      {canEdit && (
        <>
          <hr className={styles.divider} />
          <Button
            fluid
            content={t('action.editPermissions')}
            className={styles.button}
            onClick={handleEditPermissionsClick}
          />
          <Button
            fluid
            content={t('action.removeTeamFromBoard')}
            className={styles.button}
            onClick={handleDeleteClick}
          />
        </>
      )}
    </>
  );

  return onBack ? (
    <>
      <Popup.Header onBack={onBack}>
        {t(title, {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>{contentNode}</Popup.Content>
    </>
  ) : (
    contentNode
  );
});

TeamActionsStep.propTypes = {
  boardTeamId: PropTypes.string.isRequired,
  title: PropTypes.string,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

TeamActionsStep.defaultProps = {
  title: 'common.teamActions',
  onBack: undefined,
};

export default TeamActionsStep;
