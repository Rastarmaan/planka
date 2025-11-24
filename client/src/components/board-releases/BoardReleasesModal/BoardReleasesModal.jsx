/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Icon, Message } from 'semantic-ui-react';

import actions from '../../../actions';
import ModalTypes from '../../../constants/ModalTypes';
import entryActions from '../../../entry-actions';
import { useClosableModal } from '../../../hooks';
import selectors from '../../../selectors';
import CardSelectionStep from './CardSelectionStep';
import CreateReleaseForm from './CreateReleaseForm';
import ReleaseDetailsModal from './ReleaseDetailsModal';
import ReleaseItem from './ReleaseItem';

import styles from './BoardReleasesModal.module.scss';

const BoardReleasesModal = React.memo(() => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const boardId = useSelector((state) => selectors.selectPath(state).boardId);
  const boardReleases = useSelector(selectors.selectBoardReleasesForCurrentBoard);
  const modal = useSelector(selectors.selectCurrentModal);
  const isSubmitting = useSelector((state) => state.boardReleases?.isSubmitting || false);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // 1 = form, 2 = card selection
  const [releaseData, setReleaseData] = useState(null);
  const [selectedCardIds, setSelectedCardIds] = useState([]);
  const [selectedRelease, setSelectedRelease] = useState(null);

  const handleClose = useCallback(() => {
    dispatch(entryActions.closeModal());
  }, [dispatch]);

  const handleAddReleaseClick = useCallback(() => {
    setShowCreateForm(true);
    setCurrentStep(1);
    setReleaseData(null);
    setSelectedCardIds([]);
  }, []);

  const handleCreateRelease = useCallback((data) => {
    setReleaseData(data);
    setCurrentStep(2);
  }, []);

  const handleBackToForm = useCallback(() => {
    setCurrentStep(1);
  }, []);

  const handleCardSelect = useCallback((cardIds) => {
    setSelectedCardIds((prev) => {
      const newSet = new Set([...prev, ...cardIds]);
      return Array.from(newSet);
    });
  }, []);

  const handleCardDeselect = useCallback((cardIds) => {
    setSelectedCardIds((prev) => prev.filter((id) => !cardIds.includes(id)));
  }, []);

  const handleCompleteRelease = useCallback(() => {
    if (!boardId || !releaseData) return;

    setError(null);

    const cardIdsArray = Array.isArray(selectedCardIds) ? selectedCardIds : [];

    const releaseDataWithCards = {
      ...releaseData,
      cardIds: cardIdsArray,
    };

    dispatch(actions.boardReleaseCreate(boardId, releaseDataWithCards));

    // Close the form
    setShowCreateForm(false);
    setCurrentStep(1);
    setReleaseData(null);
    setSelectedCardIds([]);

    setTimeout(() => {
      dispatch(actions.boardReleasesFetch(boardId));
    }, 300);
  }, [boardId, releaseData, selectedCardIds, dispatch]);

  const handleCancelCreate = useCallback(() => {
    setShowCreateForm(false);
    setCurrentStep(1);
    setReleaseData(null);
    setSelectedCardIds([]);
  }, []);

  const handleUpdateRelease = useCallback(
    (releaseId, data) => {
      dispatch(actions.boardReleaseUpdate(releaseId, data));
    },
    [dispatch],
  );

  const handleUpdateReleaseStatus = useCallback(
    (releaseId, status) => {
      dispatch(actions.boardReleaseStatusUpdate(releaseId, status));
    },
    [dispatch],
  );

  const handleDeleteRelease = useCallback(
    (releaseId) => {
      dispatch(actions.boardReleaseDelete(releaseId));
    },
    [dispatch],
  );

  const handleReleaseClick = useCallback((release) => {
    setSelectedRelease(release);
  }, []);

  const handleCloseReleaseDetails = useCallback(() => {
    setSelectedRelease(null);
  }, []);

  const handleViewSnapshot = useCallback(
    (releaseId) => {
      handleClose();

      dispatch(actions.releaseSnapshotViewSet(releaseId));
    },
    [dispatch, handleClose],
  );

  useEffect(() => {
    if (boardId) {
      dispatch(actions.boardReleasesFetch(boardId));
    }
  }, [boardId, dispatch]);

  useClosableModal(modal && modal.type === ModalTypes.BOARD_RELEASES, handleClose);

  const [ClosableModal] = useClosableModal();

  return (
    <ClosableModal closeIcon size="large" centered={false} onClose={handleClose}>
      <ClosableModal.Header>
        <Icon name="flag checkered" />
        {t('common.releases')}
      </ClosableModal.Header>
      <ClosableModal.Content>
        <div className={styles.container}>
          {error && (
            <Message negative>
              <p>{error}</p>
            </Message>
          )}

          <Message className={styles.header}>
            <div className={styles.headerText}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                {t('common.releases')}
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
                {t('common.manageBoardReleases')}
              </p>
            </div>
            <Button
              className={styles.button}
              primary
              icon="plus"
              content={t('action.addRelease')}
              onClick={handleAddReleaseClick}
              disabled={isSubmitting}
            />
          </Message>

          {showCreateForm && currentStep === 1 && (
            <div className={styles.createForm}>
              <CreateReleaseForm
                onCreate={handleCreateRelease}
                onCancel={handleCancelCreate}
                isSubmitting={isSubmitting}
              />
            </div>
          )}

          {showCreateForm && currentStep === 2 && (
            <CardSelectionStep
              selectedCardIds={selectedCardIds}
              onCardSelect={handleCardSelect}
              onCardDeselect={handleCardDeselect}
              onBack={handleBackToForm}
              onComplete={handleCompleteRelease}
            />
          )}

          <div className={styles.releasesList}>
            {boardReleases && boardReleases.length === 0 && !showCreateForm && (
              <div className={styles.emptyState}>
                <Icon name="inbox" className={styles.icon} />
                <div className={styles.title}>{t('common.noReleasesCreatedYet')}</div>
                <div className={styles.description}>
                  {t('common.createFirstReleaseToTrackBoardMilestones')}
                </div>
              </div>
            )}
            {boardReleases && boardReleases.length > 0 && (
              <>
                <div className={styles.tableHeader}>
                  <div className={styles.nameColumn}>
                    {t('common.release', { defaultValue: 'Release' })}
                  </div>
                  <div className={styles.targetColumn}>
                    {t('common.target', { defaultValue: 'Target' })}
                  </div>
                  <div className={styles.dateColumn}>
                    {t('common.startDate', { defaultValue: 'Start Date' })}
                  </div>
                  <div className={styles.dateColumn}>
                    {t('common.endDate', { defaultValue: 'End Date' })}
                  </div>
                  <div className={styles.statusColumn}>
                    {t('common.status', { defaultValue: 'Status' })}
                  </div>
                  <div className={styles.cardsColumn}>
                    {t('common.cards', { defaultValue: 'Cards' })}
                  </div>
                  <div className={styles.actionsColumn}>
                    {t('common.actions', { defaultValue: 'Actions' })}
                  </div>
                </div>
                {boardReleases.map((release) => (
                  <ReleaseItem
                    key={release.id}
                    release={release}
                    onUpdate={handleUpdateRelease}
                    onUpdateStatus={handleUpdateReleaseStatus}
                    onDelete={handleDeleteRelease}
                    onClick={handleReleaseClick}
                    onViewSnapshot={handleViewSnapshot}
                  />
                ))}
              </>
            )}
          </div>
        </div>
        {selectedRelease && (
          <ReleaseDetailsModal release={selectedRelease} onClose={handleCloseReleaseDetails} />
        )}
      </ClosableModal.Content>
    </ClosableModal>
  );
});

export default BoardReleasesModal;
