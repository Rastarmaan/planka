/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Icon } from 'semantic-ui-react';
import { Popup } from '../../../lib/custom-ui';

import entryActions from '../../../entry-actions';
import selectors from '../../../selectors';
import { isListArchiveOrTrash } from '../../../utils/record-helpers';
import CardSelectorStep from './CardSelectorStep';

import styles from './DependenciesStep.module.scss';

const DependenciesStep = React.memo(({ cardId, onBack }) => {
  const [t] = useTranslation();

  const selectDependsOnCards = useMemo(() => selectors.makeSelectDependsOnCardsByCardId(), []);
  const selectDependentCards = useMemo(() => selectors.makeSelectDependentCardsByCardId(), []);

  const dependsOnCards = useSelector((state) => selectDependsOnCards(state, cardId));
  const dependentCards = useSelector((state) => selectDependentCards(state, cardId));

  const [showCardSelector, setShowCardSelector] = React.useState(false);

  const handleAddDependencyClick = useCallback(() => {
    setShowCardSelector(true);
  }, []);

  const handleCardSelectorClose = useCallback(() => {
    setShowCardSelector(false);
  }, []);

  const openCardModal = useCallback((id) => {
    window.open(`/cards/${id}`, '_blank');
  }, []);

  if (showCardSelector) {
    return (
      <CardSelectorStep
        currentCardId={cardId}
        excludeCardIds={[cardId, ...dependsOnCards.map((c) => c.id)]}
        onSelect={handleCardSelectorClose}
        onBack={handleCardSelectorClose}
      />
    );
  }

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.dependencies', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>
              {t('common.blockedBy', { context: 'title' })}
            </span>
            <span className={styles.sectionCount}>({dependsOnCards.length})</span>
          </div>
          {dependsOnCards.length > 0 ? (
            <div className={styles.cardList}>
              {dependsOnCards.map((card) => (
                <DependencyCard
                  key={card.id}
                  card={card}
                  cardId={cardId}
                  type="depends"
                  onClick={() => openCardModal(card.id)}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyMessage}>
              {t('common.noDependencies', { context: 'blockedBy' })}
            </div>
          )}
          <Button
            fluid
            content={t('action.addDependency')}
            onClick={handleAddDependencyClick}
            className={styles.addButton}
          />
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>
              {t('common.blocking', { context: 'title' })}
            </span>
            <span className={styles.sectionCount}>({dependentCards.length})</span>
          </div>
          {dependentCards.length > 0 ? (
            <div className={styles.cardList}>
              {dependentCards.map((card) => (
                <DependencyCard
                  key={card.id}
                  card={card}
                  cardId={cardId}
                  type="dependent"
                  onClick={() => openCardModal(card.id)}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyMessage}>
              {t('common.noDependents', { context: 'blocking' })}
            </div>
          )}
        </div>
      </Popup.Content>
    </>
  );
});

DependenciesStep.propTypes = {
  cardId: PropTypes.string.isRequired,
  onBack: PropTypes.func,
};

DependenciesStep.defaultProps = {
  onBack: undefined,
};

const DependencyCard = React.memo(({ card, cardId, type, onClick }) => {
  const dispatch = useDispatch();
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);
  const list = useSelector((state) => selectListById(state, card.listId));

  const isArchived = isListArchiveOrTrash(list);
  const isCompleted = card.isClosed;

  const handleRemove = useCallback(
    (e) => {
      e.stopPropagation();
      if (type === 'depends') {
        dispatch(entryActions.removeDependencyFromCard(null, cardId, card.id));
      }
    },
    [dispatch, cardId, card.id, type],
  );

  return (
    <div
      className={`${styles.dependencyCard} ${isCompleted ? styles.completed : ''} ${
        isArchived ? styles.archived : ''
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onClick()}
    >
      <div className={styles.cardInfo}>
        <div className={styles.cardName}>
          {isCompleted && <Icon name="check circle" className={styles.completedIcon} />}
          {card.name}
        </div>
        {list && <div className={styles.cardList}>{list.name}</div>}
      </div>
      {type === 'depends' && (
        <Button
          icon
          basic
          size="mini"
          className={styles.removeButton}
          onClick={handleRemove}
          title="Remove dependency"
        >
          <Icon name="times" />
        </Button>
      )}
    </div>
  );
});

DependencyCard.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    isClosed: PropTypes.bool,
    listId: PropTypes.string.isRequired,
  }).isRequired,
  cardId: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['depends', 'dependent']).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default DependenciesStep;
