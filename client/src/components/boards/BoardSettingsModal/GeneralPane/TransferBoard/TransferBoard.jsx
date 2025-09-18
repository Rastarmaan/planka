/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Dropdown, Form } from 'semantic-ui-react';

import entryActions from '../../../../../entry-actions';
import { usePopupInClosableContext } from '../../../../../hooks';
import selectors from '../../../../../selectors';
import ConfirmationStep from '../../../../common/ConfirmationStep';

import styles from './TransferBoard.module.scss';

const TransferBoard = React.memo(() => {
  const selectBoardById = useMemo(() => selectors.makeSelectBoardById(), []);

  const boardId = useSelector((state) => selectors.selectCurrentModal(state).params.id);
  const board = useSelector((state) => selectBoardById(state, boardId));

  const allProjectIds = useSelector(selectors.selectProjectIdsForCurrentUser);
  const projects = useSelector((state) =>
    allProjectIds
      .map((id) => selectors.selectProjectById(state, id))
      .filter(
        (project) => project && project.id !== board.projectId && !project.ownerProjectManagerId,
      ),
  );

  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const handleProjectChange = useCallback((event, { value }) => {
    setSelectedProjectId(value);
  }, []);

  const handleTransferConfirm = useCallback(() => {
    if (selectedProjectId) {
      dispatch(entryActions.transferBoard(boardId, selectedProjectId));
    }
  }, [boardId, selectedProjectId, dispatch]);

  const ConfirmationPopup = usePopupInClosableContext(ConfirmationStep);

  const projectOptions = useMemo(
    () =>
      projects.map((project) => ({
        key: project.id,
        value: project.id,
        text: project.name,
      })),
    [projects],
  );

  if (projects.length === 0) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.noProjectsMessage}>{t('common.noProjectsAvailableForTransfer')}</div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Form>
        <Form.Field>
          <label htmlFor="projectSelect">{t('common.selectProject')}</label>
          <Dropdown
            id="projectSelect"
            placeholder={t('common.selectProject')}
            fluid
            selection
            options={projectOptions}
            value={selectedProjectId}
            onChange={handleProjectChange}
          />
        </Form.Field>
        <div className={styles.action}>
          <ConfirmationPopup
            title="common.transferBoard"
            content="common.areYouSureYouWantToTransferThisBoard"
            buttonContent="action.transferBoard"
            onConfirm={handleTransferConfirm}
            disabled={!selectedProjectId}
          >
            <Button className={styles.actionButton} disabled={!selectedProjectId} positive>
              {t('action.transferBoard', {
                context: 'title',
              })}
            </Button>
          </ConfirmationPopup>
        </div>
      </Form>
    </div>
  );
});

export default TransferBoard;
