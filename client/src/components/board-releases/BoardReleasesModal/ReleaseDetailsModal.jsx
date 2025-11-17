/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import PropTypes from 'prop-types';
import React, { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Icon, Modal, Table } from 'semantic-ui-react';
import { createSelector } from 'redux-orm';

import { CardTypes } from '../../../constants/Enums';
import Paths from '../../../constants/Paths';
import actions from '../../../actions';
import orm from '../../../orm';

import styles from './ReleaseDetailsModal.module.scss';

const ReleaseDetailsModal = React.memo(({ release, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const selectReleaseCards = useMemo(
    () =>
      createSelector(
        orm,
        (_, releaseId) => releaseId,
        ({ ReleaseCard, Card, List }, releaseId) => {
          const associations = ReleaseCard.filter({ releaseId }).toRefArray();

          const cardIds = associations.map((rc) => rc.cardId);
          return Card.filter((card) => cardIds.includes(card.id))
            .toModelArray()
            .map((card) => {
              const list = List.withId(card.listId);
              return {
                ...card.ref,
                listName: list ? list.name : card.listId,
              };
            });
        },
      ),
    [],
  );

  const releaseCards = useSelector((state) => selectReleaseCards(state, release.id));

  const handleCardClick = useCallback(
    (card) => {
      navigate(Paths.CARDS.replace(':id', card.id));
    },
    [navigate],
  );

  const handleRemoveCard = useCallback(
    (cardId) => {
      dispatch(actions.releaseCardRemove(release.id, cardId));
    },
    [dispatch, release.id],
  );

  const getCardTypeLabel = (type) => {
    switch (type) {
      case CardTypes.EPIC:
        return t('common.epic', { defaultValue: 'Epic' });
      case CardTypes.STORY:
        return t('common.story', { defaultValue: 'Story' });
      case CardTypes.PROJECT:
        return t('common.project', { defaultValue: 'Task' });
      default:
        return t('common.card', { defaultValue: 'Card' });
    }
  };

  const getCardTypeIcon = (type) => {
    switch (type) {
      case CardTypes.EPIC:
        return 'lightning';
      case CardTypes.STORY:
        return 'book';
      case CardTypes.PROJECT:
        return 'check square';
      default:
        return 'sticky note';
    }
  };

  return (
    <Modal open onClose={onClose} size="large" closeIcon>
      <Modal.Header>
        <Icon name="flag checkered" />
        {release.version} - {release.name}
      </Modal.Header>
      <Modal.Content>
        <div className={styles.container}>
          {release.target && (
            <div className={styles.description}>
              <strong>{t('common.target')}:</strong> {release.target}
            </div>
          )}

          <div className={styles.stats}>
            <strong>{t('common.cards')}:</strong> {releaseCards.length}
          </div>

          {releaseCards.length === 0 ? (
            <div className={styles.emptyState}>
              <Icon name="inbox" size="huge" />
              <p>{t('common.noCardsFound')}</p>
            </div>
          ) : (
            <Table celled striped>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell width={2}>
                    {t('common.type', { defaultValue: 'Type' })}
                  </Table.HeaderCell>
                  <Table.HeaderCell width={6}>
                    {t('common.name', { defaultValue: 'Name' })}
                  </Table.HeaderCell>
                  <Table.HeaderCell width={3}>
                    {t('common.list', { defaultValue: 'List' })}
                  </Table.HeaderCell>
                  <Table.HeaderCell width={2}>
                    {t('common.actions', { defaultValue: 'Actions' })}
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {releaseCards.map((card) => (
                  <Table.Row key={card.id}>
                    <Table.Cell>
                      <Icon name={getCardTypeIcon(card.type)} />
                      {getCardTypeLabel(card.type)}
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={styles.cardLink}
                        onClick={() => handleCardClick(card)}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleCardClick(card);
                          }
                        }}
                      >
                        {card.name}
                      </span>
                    </Table.Cell>
                    <Table.Cell>{card.listName}</Table.Cell>
                    <Table.Cell textAlign="center">
                      <Button
                        icon
                        size="small"
                        color="red"
                        basic
                        onClick={() => handleRemoveCard(card.id)}
                        title={t('action.removeFromRelease', {
                          defaultValue: 'Remove from release',
                        })}
                      >
                        <Icon name="times" />
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </div>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={onClose}>
          <Icon name="close" />
          {t('action.close', { defaultValue: 'Close' })}
        </Button>
      </Modal.Actions>
    </Modal>
  );
});

ReleaseDetailsModal.propTypes = {
  release: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onClose: PropTypes.func.isRequired,
};

export default ReleaseDetailsModal;
