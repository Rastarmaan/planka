/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Icon, Label, Message, Table } from 'semantic-ui-react';

import styles from './SyncPane.module.scss';

const SyncPane = React.memo(({ boardLinks, projects, onUpdateLink, onDeleteLink }) => {
  const [t] = useTranslation();
  const [updatingLinkId, setUpdatingLinkId] = useState(null);

  const syncDirectionOptions = [
    { key: 'bidirectional', value: 'bidirectional', text: t('common.bidirectional') },
    { key: 'none', value: 'none', text: t('common.disabled') },
  ];

  const handleSyncDirectionChange = useCallback(
    async (linkId, newDirection) => {
      setUpdatingLinkId(linkId);
      try {
        await onUpdateLink(linkId, {
          syncDirection: newDirection,
          syncEnabled: newDirection !== 'none',
        });
      } finally {
        setUpdatingLinkId(null);
      }
    },
    [onUpdateLink],
  );

  const handleDeleteLink = useCallback(
    async (linkId) => {
      // eslint-disable-next-line no-alert
      if (window.confirm(t('common.confirmUnlinkBoard'))) {
        await onDeleteLink(linkId);
      }
    },
    [onDeleteLink, t],
  );

  const getLinkedBoardInfo = useCallback(
    (link) => {
      const linkedBoardId = link.isSource ? link.linkedBoardId : link.sourceBoardId;

      // eslint-disable-next-line no-restricted-syntax
      for (const project of projects) {
        const board = project.boards?.find((b) => b.id === linkedBoardId);
        if (board) {
          return { boardName: board.name, projectName: project.name };
        }
      }
      return { boardName: t('common.unknown'), projectName: t('common.unknown') };
    },
    [projects, t],
  );

  if (!boardLinks || boardLinks.length === 0) {
    return (
      <Message info>
        <Message.Header>{t('common.noBoardLinks')}</Message.Header>
        <p>{t('common.noBoardLinksDescription')}</p>
      </Message>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Message info>
        <p>{t('common.boardLinksDescription')}</p>
      </Message>

      <Table basic="very">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{t('common.linkedBoard')}</Table.HeaderCell>
            <Table.HeaderCell>{t('common.project')}</Table.HeaderCell>
            <Table.HeaderCell>{t('common.syncDirection')}</Table.HeaderCell>
            <Table.HeaderCell>{t('common.status')}</Table.HeaderCell>
            <Table.HeaderCell textAlign="right">{t('common.actions')}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {boardLinks.map((link) => {
            const { boardName, projectName } = getLinkedBoardInfo(link);
            const isUpdating = updatingLinkId === link.id;

            return (
              <Table.Row key={link.id}>
                <Table.Cell>
                  <strong>{boardName}</strong>
                </Table.Cell>
                <Table.Cell>{projectName}</Table.Cell>
                <Table.Cell>
                  <Dropdown
                    selection
                    options={syncDirectionOptions}
                    value={link.syncEnabled ? link.syncDirection : 'none'}
                    onChange={(e, { value }) => handleSyncDirectionChange(link.id, value)}
                    disabled={isUpdating}
                    loading={isUpdating}
                    className={styles.dropdown}
                  />
                </Table.Cell>
                <Table.Cell>
                  {link.syncEnabled ? (
                    <Label color="green" size="small">
                      <Icon name="sync" />
                      {t('common.syncing')}
                    </Label>
                  ) : (
                    <Label color="grey" size="small">
                      <Icon name="pause" />
                      {t('common.paused')}
                    </Label>
                  )}
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Button
                    basic
                    negative
                    size="small"
                    icon="unlink"
                    content={t('action.unlink')}
                    onClick={() => handleDeleteLink(link.id)}
                  />
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
});

SyncPane.propTypes = {
  boardLinks: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  projects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdateLink: PropTypes.func.isRequired,
  onDeleteLink: PropTypes.func.isRequired,
};

export default SyncPane;
