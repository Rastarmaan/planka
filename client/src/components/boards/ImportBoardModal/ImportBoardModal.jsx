/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Form, Message, Modal } from 'semantic-ui-react';

const ImportBoardModal = React.memo(
  ({ projects, currentProjectId, currentBoardId, onImport, onClose }) => {
    const [t] = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [selectedBoardId, setSelectedBoardId] = useState('');
    const [syncDirection, setSyncDirection] = useState('bidirectional');

    const availableProjects = useMemo(
      () => projects.filter((project) => project.id !== currentProjectId),
      [projects, currentProjectId],
    );

    const availableBoards = useMemo(() => {
      if (!selectedProjectId) return [];
      const project = projects.find((p) => p.id === selectedProjectId);
      return project?.boards?.filter((board) => board.id !== currentBoardId) || [];
    }, [projects, selectedProjectId, currentBoardId]);

    const projectOptions = useMemo(
      () =>
        availableProjects.map((project) => ({
          key: project.id,
          value: project.id,
          text: project.name,
        })),
      [availableProjects],
    );

    const boardOptions = useMemo(
      () =>
        availableBoards.map((board) => ({
          key: board.id,
          value: board.id,
          text: board.name,
        })),
      [availableBoards],
    );

    const syncDirectionOptions = useMemo(
      () => [
        { key: 'bidirectional', value: 'bidirectional', text: t('common.bidirectional') },
        { key: 'none', value: 'none', text: t('common.noSync') },
      ],
      [t],
    );

    const handleProjectChange = useCallback((e, { value }) => {
      setSelectedProjectId(value);
      setSelectedBoardId('');
    }, []);

    const handleBoardChange = useCallback((e, { value }) => {
      setSelectedBoardId(value);
    }, []);

    const handleSubmit = useCallback(async () => {
      if (!selectedBoardId) {
        setError(t('common.pleaseSelectBoard'));
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        await onImport({
          sourceBoardId: selectedBoardId,
          syncEnabled: syncDirection !== 'none',
          syncDirection,
          importCards: true,
          importMembers: true,
          importLabels: true,
        });
        onClose();
      } catch (err) {
        setError(err.message || t('common.importFailed'));
        setIsSubmitting(false);
      }
    }, [selectedBoardId, syncDirection, onImport, onClose, t]);

    return (
      <Modal open closeIcon size="small" centered={false} onClose={onClose}>
        <Modal.Header>{t('common.importBoard')}</Modal.Header>
        <Modal.Content>
          {error && (
            <Message negative>
              <Message.Header>{t('common.error')}</Message.Header>
              <p>{error}</p>
            </Message>
          )}

          <Form>
            <Form.Field>
              <Dropdown
                fluid
                search
                selection
                label={t('common.selectProjectForImport')}
                placeholder={t('common.selectProjectForImport')}
                options={projectOptions}
                value={selectedProjectId}
                onChange={handleProjectChange}
              />
            </Form.Field>
            <Form.Field disabled={!selectedProjectId}>
              <Dropdown
                fluid
                search
                selection
                label={t('common.selectBoardForImport')}
                placeholder={t('common.selectBoardForImport')}
                options={boardOptions}
                value={selectedBoardId}
                onChange={handleBoardChange}
                disabled={!selectedProjectId}
              />
            </Form.Field>
            <Form.Field>
              <Dropdown
                fluid
                selection
                label={t('common.syncDirection')}
                options={syncDirectionOptions}
                value={syncDirection}
                onChange={(e, { value }) => setSyncDirection(value)}
              />
            </Form.Field>
            {syncDirection !== 'none' && (
              <Message info>
                <p>
                  {syncDirection === 'bidirectional'
                    ? t('common.bidirectionalSyncDescription')
                    : t('common.oneWaySyncDescription')}
                </p>
              </Message>
            )}
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button content={t('common.cancel')} onClick={onClose} />
          <Button
            positive
            loading={isSubmitting}
            disabled={isSubmitting || !selectedBoardId}
            content={t('action.import', { defaultValue: 'Import' })}
            onClick={handleSubmit}
          />
        </Modal.Actions>
      </Modal>
    );
  },
);

ImportBoardModal.propTypes = {
  projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentProjectId: PropTypes.string.isRequired,
  currentBoardId: PropTypes.string.isRequired,
  onImport: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ImportBoardModal;
