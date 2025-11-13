/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Button, Form, Grid, Header, Dropdown, Input, Modal } from 'semantic-ui-react';

import api from '../../api';
import selectors from '../../selectors';

import styles from './FiltersModal.module.scss';

const CARD_TYPES = [
  { key: 'project', text: 'Project', value: 'project' },
  { key: 'story', text: 'Story', value: 'story' },
  { key: 'epic', text: 'Epic', value: 'epic' },
];

const STORAGE_KEY = 'planka_cards_filter_state';

function FiltersModal({ onClose }) {
  const [t] = useTranslation();
  const accessToken = useSelector(selectors.selectAccessToken);
  const currentUserId = useSelector(selectors.selectCurrentUserId);

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [labels, setLabels] = useState([]);

  const [selectedProjectIds, setSelectedProjectIds] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedLabelIds, setSelectedLabelIds] = useState([]);
  const [selectedCardType, setSelectedCardType] = useState('');
  const [startDateFrom, setStartDateFrom] = useState('');
  const [startDateTo, setStartDateTo] = useState('');
  const [dueDateFrom, setDueDateFrom] = useState('');
  const [dueDateTo, setDueDateTo] = useState('');
  const [weightFrom, setWeightFrom] = useState('');
  const [weightTo, setWeightTo] = useState('');

  const [filteredCards, setFilteredCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeaders = useCallback(() => {
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  }, [accessToken]);

  useEffect(() => {
    if (!currentUserId) return;

    const savedState = localStorage.getItem(`${STORAGE_KEY}_${currentUserId}`);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setSelectedProjectIds(parsed.selectedProjectIds || []);
        setSelectedUserIds(parsed.selectedUserIds || []);
        setSelectedLabelIds(parsed.selectedLabelIds || []);
        setSelectedCardType(parsed.selectedCardType || '');
        setStartDateFrom(parsed.startDateFrom || '');
        setStartDateTo(parsed.startDateTo || '');
        setDueDateFrom(parsed.dueDateFrom || '');
        setDueDateTo(parsed.dueDateTo || '');
        setWeightFrom(parsed.weightFrom || '');
        setWeightTo(parsed.weightTo || '');
      } catch (err) {
        console.error('Error parsing saved filter state:', err);
      }
    }
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;

    const stateToSave = {
      selectedProjectIds,
      selectedUserIds,
      selectedLabelIds,
      selectedCardType,
      startDateFrom,
      startDateTo,
      dueDateFrom,
      dueDateTo,
      weightFrom,
      weightTo,
    };
    localStorage.setItem(`${STORAGE_KEY}_${currentUserId}`, JSON.stringify(stateToSave));
  }, [
    currentUserId,
    selectedProjectIds,
    selectedUserIds,
    selectedLabelIds,
    selectedCardType,
    startDateFrom,
    startDateTo,
    dueDateFrom,
    dueDateTo,
    weightFrom,
    weightTo,
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = getAuthHeaders();

        const [projectsResponse, usersResponse, labelsResponse] = await Promise.all([
          api.getAllProjects(headers),
          api.getUsers(headers),
          api.getGlobalLabels(headers),
        ]);

        setProjects(projectsResponse.items || []);
        setUsers(usersResponse.items || []);
        setLabels(labelsResponse.items || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to fetch data');
      }
    };

    fetchData();
  }, [getAuthHeaders]);

  const handleFilter = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filters = {};

      if (selectedProjectIds.length > 0) {
        filters.projectIds = selectedProjectIds.join(',');
      }
      if (selectedUserIds.length > 0) {
        filters.userIds = selectedUserIds.join(',');
      }
      if (selectedLabelIds.length > 0) {
        filters.labelIds = selectedLabelIds.join(',');
      }
      if (selectedCardType) {
        filters.cardType = selectedCardType;
      }
      if (startDateFrom) {
        filters.startDateFrom = startDateFrom;
      }
      if (startDateTo) {
        filters.startDateTo = startDateTo;
      }
      if (dueDateFrom) {
        filters.dueDateFrom = dueDateFrom;
      }
      if (dueDateTo) {
        filters.dueDateTo = dueDateTo;
      }
      if (weightFrom) {
        filters.weightFrom = weightFrom;
      }
      if (weightTo) {
        filters.weightTo = weightTo;
      }

      const headers = getAuthHeaders();
      const response = await api.filterCards(filters, headers);
      setFilteredCards(response.items || []);
    } catch (err) {
      console.error('Error filtering cards:', err);
      setError(err.message || 'Failed to filter cards');
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedProjectIds,
    selectedUserIds,
    selectedLabelIds,
    selectedCardType,
    startDateFrom,
    startDateTo,
    dueDateFrom,
    dueDateTo,
    weightFrom,
    weightTo,
    getAuthHeaders,
  ]);

  const handleReset = useCallback(() => {
    setSelectedProjectIds([]);
    setSelectedUserIds([]);
    setSelectedLabelIds([]);
    setSelectedCardType('');
    setStartDateFrom('');
    setStartDateTo('');
    setDueDateFrom('');
    setDueDateTo('');
    setWeightFrom('');
    setWeightTo('');
    setFilteredCards([]);
    setError(null);
  }, []);

  const projectOptions = useMemo(
    () =>
      projects.map((project) => ({
        key: project.id,
        value: project.id,
        text: project.name,
      })),
    [projects],
  );

  const userOptions = useMemo(
    () =>
      users.map((user) => ({
        key: user.id,
        value: user.id,
        text: user.name || user.username,
      })),
    [users],
  );

  const labelOptions = useMemo(
    () =>
      labels.map((label) => ({
        key: label.id,
        value: label.id,
        text: label.name,
      })),
    [labels],
  );

  return (
    <Modal open onClose={onClose} size="large" closeIcon>
      <Modal.Header>{t('common.cardsFilter', { defaultValue: 'Cards Filter' })}</Modal.Header>
      <Modal.Content scrolling className={styles.content}>
        <Form>
          <Grid columns={2} stackable>
            <Grid.Row>
              <Grid.Column>
                <Form.Field>
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label>{t('common.projects', { defaultValue: 'Projects' })}</label>
                  <Dropdown
                    placeholder={t('common.selectProjects', { defaultValue: 'Select Projects' })}
                    fluid
                    multiple
                    search
                    selection
                    options={projectOptions}
                    value={selectedProjectIds}
                    onChange={(e, { value }) => setSelectedProjectIds(value)}
                  />
                </Form.Field>
              </Grid.Column>

              <Grid.Column>
                <Form.Field>
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label>{t('common.users', { defaultValue: 'Users' })}</label>
                  <Dropdown
                    placeholder={t('common.selectUsers', { defaultValue: 'Select Users' })}
                    fluid
                    multiple
                    search
                    selection
                    options={userOptions}
                    value={selectedUserIds}
                    onChange={(e, { value }) => setSelectedUserIds(value)}
                  />
                </Form.Field>
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column>
                <Form.Field>
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label>{t('common.labels', { defaultValue: 'Labels' })}</label>
                  <Dropdown
                    placeholder={t('common.selectLabels', { defaultValue: 'Select Labels' })}
                    fluid
                    multiple
                    search
                    selection
                    options={labelOptions}
                    value={selectedLabelIds}
                    onChange={(e, { value }) => setSelectedLabelIds(value)}
                  />
                </Form.Field>
              </Grid.Column>

              <Grid.Column>
                <Form.Field>
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label>{t('common.cardType', { defaultValue: 'Card Type' })}</label>
                  <Dropdown
                    placeholder={t('common.selectCardType', { defaultValue: 'Select Type' })}
                    fluid
                    search
                    selection
                    clearable
                    options={CARD_TYPES}
                    value={selectedCardType}
                    onChange={(e, { value }) => setSelectedCardType(value)}
                  />
                </Form.Field>
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column>
                <Form.Field>
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label>{t('common.startDate', { defaultValue: 'Start Date' })}</label>
                  <Input
                    type="date"
                    fluid
                    value={startDateFrom}
                    onChange={(e) => setStartDateFrom(e.target.value)}
                  />
                </Form.Field>
              </Grid.Column>

              <Grid.Column>
                <Form.Field>
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label>{t('common.to', { defaultValue: 'To' })}</label>
                  <Input
                    type="date"
                    fluid
                    value={startDateTo}
                    onChange={(e) => setStartDateTo(e.target.value)}
                  />
                </Form.Field>
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column>
                <Form.Field>
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label>{t('common.dueDate', { defaultValue: 'Due Date' })}</label>
                  <Input
                    type="date"
                    fluid
                    value={dueDateFrom}
                    onChange={(e) => setDueDateFrom(e.target.value)}
                  />
                </Form.Field>
              </Grid.Column>

              <Grid.Column>
                <Form.Field>
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label>{t('common.to', { defaultValue: 'To' })}</label>
                  <Input
                    type="date"
                    fluid
                    value={dueDateTo}
                    onChange={(e) => setDueDateTo(e.target.value)}
                  />
                </Form.Field>
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column>
                <Form.Field>
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label>{t('common.weight', { defaultValue: 'Weight From' })}</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    fluid
                    placeholder="1"
                    value={weightFrom}
                    onChange={(e) => setWeightFrom(e.target.value)}
                  />
                </Form.Field>
              </Grid.Column>

              <Grid.Column>
                <Form.Field>
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label>{t('common.to', { defaultValue: 'Weight To' })}</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    fluid
                    placeholder="10"
                    value={weightTo}
                    onChange={(e) => setWeightTo(e.target.value)}
                  />
                </Form.Field>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Form>

        {error && <div className={styles.error}>{error}</div>}

        {filteredCards.length > 0 && (
          <div className={styles.results}>
            <Header as="h4">
              {t('common.results', { defaultValue: 'Results' })} ({filteredCards.length})
            </Header>
            <div className={styles.cardsList}>
              {filteredCards.map((card) => (
                <div key={card.id} className={styles.cardItem}>
                  <div className={styles.cardHeader}>
                    <strong>{card.name}</strong>
                    <span className={styles.cardType}>{card.type}</span>
                  </div>
                  {card.description && <p className={styles.cardDescription}>{card.description}</p>}
                  <div className={styles.cardMeta}>
                    {card.weight && (
                      <span>
                        <strong>{t('common.weight', { defaultValue: 'Weight' })}:</strong>{' '}
                        {card.weight}
                      </span>
                    )}
                    {card.startDate && (
                      <span>
                        <strong>{t('common.startDate', { defaultValue: 'Start' })}:</strong>{' '}
                        {new Date(card.startDate).toLocaleDateString()}
                      </span>
                    )}
                    {card.dueDate && (
                      <span>
                        <strong>{t('common.dueDate', { defaultValue: 'Due' })}:</strong>{' '}
                        {new Date(card.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredCards.length === 0 && !isLoading && (
          <div className={styles.emptyState}>
            {t('common.selectFiltersToSearch', {
              defaultValue: 'Select filters and click "Filter" to search for cards.',
            })}
          </div>
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={handleReset} disabled={isLoading}>
          {t('action.reset', { defaultValue: 'Reset' })}
        </Button>
        <Button primary onClick={handleFilter} loading={isLoading} disabled={isLoading}>
          {t('action.filter', { defaultValue: 'Filter' })}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

FiltersModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default React.memo(FiltersModal);
