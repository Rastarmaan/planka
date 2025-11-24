/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Button, Checkbox, Icon, Input, Message } from 'semantic-ui-react';

import { CardTypes } from '../../../constants/Enums';
import selectors from '../../../selectors';

import styles from './CardSelectionStep.module.scss';

const CardSelectionStep = React.memo(
  ({ selectedCardIds, onCardSelect, onCardDeselect, onBack, onComplete }) => {
    const { t } = useTranslation();
    const allCards = useSelector((state) => selectors.selectCardsForCurrentBoard(state));
    const cardIdsInReleases = useSelector(selectors.selectCardIdsInReleases);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const getDescendantCards = useCallback((cardId, cards) => {
      const children = cards.filter((c) => c.parentCardId === cardId);
      let descendants = children.map((c) => c.id);

      children.forEach((child) => {
        descendants = [...descendants, ...getDescendantCards(child.id, cards)];
      });

      return descendants;
    }, []);

    const handleCardCheck = useCallback(
      (cardId, isChecked) => {
        if (isChecked) {
          const descendantIds = getDescendantCards(cardId, allCards);
          onCardSelect([cardId, ...descendantIds]);
        } else {
          const descendantIds = getDescendantCards(cardId, allCards);
          onCardDeselect([cardId, ...descendantIds]);
        }
      },
      [allCards, getDescendantCards, onCardSelect, onCardDeselect],
    );

    const organizedCards = useMemo(() => {
      if (!allCards || allCards.length === 0) return [];

      const filtered = allCards.filter((card) => {
        if (cardIdsInReleases.includes(card.id)) {
          return false;
        }

        if (searchTerm && !card.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }

        if (filterType !== 'all') {
          if (filterType === 'epic' && card.type !== CardTypes.EPIC) return false;
          if (filterType === 'story' && card.type !== CardTypes.STORY) return false;
          if (filterType === 'project' && card.type !== CardTypes.PROJECT) return false;
        }

        return true;
      });

      const cardMap = new Map(filtered.map((c) => [c.id, { ...c, children: [], level: 0 }]));
      const roots = [];

      filtered.forEach((card) => {
        const node = cardMap.get(card.id);
        if (card.parentCardId && cardMap.has(card.parentCardId)) {
          const parent = cardMap.get(card.parentCardId);
          parent.children.push(node);
          node.level = parent.level + 1;
        } else {
          roots.push(node);
        }
      });

      const flattenTree = (nodes, result = []) => {
        nodes.forEach((node) => {
          result.push(node);
          if (node.children.length > 0) {
            flattenTree(node.children, result);
          }
        });
        return result;
      };

      return flattenTree(roots);
    }, [allCards, searchTerm, filterType, cardIdsInReleases]);

    const selectionSummary = useMemo(() => {
      if (!selectedCardIds || selectedCardIds.length === 0) return null;

      const selectedCards = allCards.filter((c) => selectedCardIds.includes(c.id));
      const epics = selectedCards.filter((c) => c.type === CardTypes.EPIC).length;
      const stories = selectedCards.filter((c) => c.type === CardTypes.STORY).length;
      const projects = selectedCards.filter((c) => c.type === CardTypes.PROJECT).length;

      return { total: selectedCardIds.length, epics, stories, projects };
    }, [selectedCardIds, allCards]);

    const getCardTypeIcon = useCallback((type) => {
      switch (type) {
        case CardTypes.EPIC:
          return 'lightning';
        case CardTypes.STORY:
          return 'book';
        case CardTypes.TASK:
          return 'check square';
        default:
          return 'sticky note';
      }
    }, []);

    const getCardTypeBadge = useCallback((type) => {
      const typeLabels = {
        [CardTypes.EPIC]: 'Epic',
        [CardTypes.STORY]: 'Story',
        [CardTypes.TASK]: 'Task',
      };

      return typeLabels[type] || 'Card';
    }, []);

    const handleSelectAll = useCallback(() => {
      onCardSelect(organizedCards.map((c) => c.id));
    }, [organizedCards, onCardSelect]);

    const handleDeselectAll = useCallback(() => {
      onCardDeselect(selectedCardIds);
    }, [selectedCardIds, onCardDeselect]);

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h3>{t('action.selectCardsForRelease')}</h3>
            <p>{t('common.selectCardsToIncludeInThisRelease')}</p>
          </div>
        </div>

        <div className={styles.filters}>
          <Input
            icon="search"
            placeholder={t('action.searchCards')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <Button.Group className={styles.typeFilter}>
            <Button active={filterType === 'all'} onClick={() => setFilterType('all')}>
              {t('common.all')}
            </Button>
            <Button active={filterType === 'epic'} onClick={() => setFilterType('epic')}>
              <Icon name="lightning" />
              {t('common.epics')}
            </Button>
            <Button active={filterType === 'story'} onClick={() => setFilterType('story')}>
              <Icon name="book" />
              {t('common.stories')}
            </Button>
            <Button active={filterType === 'project'} onClick={() => setFilterType('project')}>
              <Icon name="folder" />
              {t('common.projects')}
            </Button>
          </Button.Group>
        </div>

        <div className={styles.bulkActions}>
          <Button size="small" onClick={handleSelectAll}>
            <Icon name="check circle" />
            {t('action.selectAll')}
          </Button>
          <Button size="small" onClick={handleDeselectAll}>
            <Icon name="circle outline" />
            {t('action.deselectAll')}
          </Button>
        </div>

        {selectionSummary && (
          <Message info className={styles.summary}>
            <Icon name="info circle" />
            <strong>{selectionSummary.total}</strong> {t('common.cardsSelected')}
            {selectionSummary.epics > 0 && ` • ${selectionSummary.epics} ${t('common.epics')}`}
            {selectionSummary.stories > 0 &&
              ` • ${selectionSummary.stories} ${t('common.stories')}`}
            {selectionSummary.projects > 0 &&
              ` • ${selectionSummary.projects} ${t('common.projects')}`}
          </Message>
        )}

        <div className={styles.cardsList}>
          {organizedCards.length === 0 ? (
            <div className={styles.emptyState}>
              <Icon name="inbox" size="huge" />
              <p>{t('common.noCardsFound')}</p>
            </div>
          ) : (
            organizedCards.map((card) => {
              const isChecked = selectedCardIds.includes(card.id);
              const hasChildren = card.children && card.children.length > 0;

              return (
                <div
                  key={card.id}
                  className={styles.cardItem}
                  style={{ paddingLeft: `${card.level * 24 + 12}px` }}
                >
                  <Checkbox
                    checked={isChecked}
                    onChange={(e, { checked }) => handleCardCheck(card.id, checked)}
                    className={styles.checkbox}
                  />
                  <Icon name={getCardTypeIcon(card.type)} className={styles.cardIcon} />
                  <div className={styles.cardInfo}>
                    <div className={styles.cardName}>
                      {card.level > 0 && <span className={styles.hierarchy}>↳ </span>}
                      {card.name}
                    </div>
                    <div className={styles.cardMeta}>
                      <span className={styles.cardType}>{getCardTypeBadge(card.type)}</span>
                      {hasChildren && (
                        <span className={styles.childCount}>
                          <Icon name="sitemap" size="small" />
                          {card.children.length} {t('common.children')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className={styles.actions}>
          <Button onClick={onBack}>
            <Icon name="arrow left" />
            {t('action.back')}
          </Button>
          <Button
            primary
            onClick={onComplete}
            disabled={!selectedCardIds || selectedCardIds.length === 0}
          >
            {t('action.createRelease')}
            <Icon name="arrow right" />
          </Button>
        </div>
      </div>
    );
  },
);

CardSelectionStep.propTypes = {
  selectedCardIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onCardSelect: PropTypes.func.isRequired,
  onCardDeselect: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
};

export default CardSelectionStep;
