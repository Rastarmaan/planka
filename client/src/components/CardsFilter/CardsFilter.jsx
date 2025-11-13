/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Button, Form, Grid, Header, Segment, Dropdown, Input } from 'semantic-ui-react';

import api from '../../api';
import selectors from '../../selectors';

import styles from './CardsFilter.module.scss';

const CARD_TYPES = [
  { key: 'project', text: 'Project', value: 'project' },
  { key: 'story', text: 'Story', value: 'story' },
  { key: 'epic', text: 'Epic', value: 'epic' },
];

const STORAGE_KEY = 'planka_cards_filter_state';

function CardsFilter({ currentUserId }) {
  const [t] = useTranslation();
  const accessToken = useSelector(selectors.selectAccessToken);

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
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to parse saved filter state:', e);
      }
    }
  }, [currentUserId]);

  const saveFilterState = useCallback(() => {
    const state = {
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
    localStorage.setItem(`${STORAGE_KEY}_${currentUserId}`, JSON.stringify(state));
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

        const projectsResponse = await api.getProjects(headers);
        setProjects(projectsResponse.items || []);

        const usersResponse = await api.getUsers(headers);
        setUsers(usersResponse.items || []);

        const labelsResponse = await api.getGlobalLabels(headers);
        setLabels(labelsResponse.items || []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch filter data:', err);
        setError(err.message);
      }
    };

    fetchData();
  }, [getAuthHeaders]);

  const handleFilter = useCallback(async () => {
    setIsLoading(true);
    setError(null);

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
      filters.startDateFrom = new Date(startDateFrom).toISOString();
    }
    if (startDateTo) {
      filters.startDateTo = new Date(startDateTo).toISOString();
    }
    if (dueDateFrom) {
      filters.dueDateFrom = new Date(dueDateFrom).toISOString();
    }
    if (dueDateTo) {
      filters.dueDateTo = new Date(dueDateTo).toISOString();
    }
    if (weightFrom) {
      filters.weightFrom = weightFrom;
    }
    if (weightTo) {
      filters.weightTo = weightTo;
    }

    try {
      const headers = getAuthHeaders();
      const response = await api.filterCards(filters, headers);
      setFilteredCards(response.items || []);
      saveFilterState();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to filter cards:', err);
      setError(err.message);
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
    saveFilterState,
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
    localStorage.removeItem(`${STORAGE_KEY}_${currentUserId}`);
  }, [currentUserId]);

  const projectOptions = useMemo(
    () =>
      projects.map((project) => ({
        key: project.id,
        text: project.name,
        value: project.id,
      })),
    [projects],
  );

  const userOptions = useMemo(
    () =>
      users.map((user) => ({
        key: user.id,
        text: user.name || user.username,
        value: user.id,
      })),
    [users],
  );

  const labelOptions = useMemo(
    () =>
      labels.map((label) => ({
        key: label.id,
        text: label.name,
        value: label.id,
      })),
    [labels],
  );

  return (
    <div className={styles.wrapper}>
      <Segment className={styles.container}>
        <Header as="h1">{t('common.filterCards', { defaultValue: 'Filter Cards' })}</Header>

        {error && (
          <Segment color="red">
            {t('common.error', { defaultValue: 'Error' })}: {error}
          </Segment>
        )}

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
                    placeholder={t('common.selectCardType', { defaultValue: 'Select Card Type' })}
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
                  <label>{t('common.startDateFrom', { defaultValue: 'Start Date From' })}</label>
                  <Input
                    type="date"
                    name="startDateFrom"
                    placeholder={t('common.selectDate', { defaultValue: 'Select Date' })}
                    value={startDateFrom}
                    onChange={(e) => setStartDateFrom(e.target.value)}
                  />
                </Form.Field>
              </Grid.Column>

              <Grid.Column>
                <Form.Field>
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label>{t('common.startDateTo', { defaultValue: 'Start Date To' })}</label>
                  <Input
                    type="date"
                    name="startDateTo"
                    placeholder={t('common.selectDate', { defaultValue: 'Select Date' })}
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
                  <label>{t('common.dueDateFrom', { defaultValue: 'Due Date From' })}</label>
                  <Input
                    type="date"
                    name="dueDateFrom"
                    placeholder={t('common.selectDate', { defaultValue: 'Select Date' })}
                    value={dueDateFrom}
                    onChange={(e) => setDueDateFrom(e.target.value)}
                  />
                </Form.Field>
              </Grid.Column>

              <Grid.Column>
                <Form.Field>
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label>{t('common.dueDateTo', { defaultValue: 'Due Date To' })}</label>
                  <Input
                    type="date"
                    name="dueDateTo"
                    placeholder={t('common.selectDate', { defaultValue: 'Select Date' })}
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
                  <label>{t('common.weightFrom', { defaultValue: 'Weight From (1-10)' })}</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="1"
                    value={weightFrom}
                    onChange={(e) => setWeightFrom(e.target.value)}
                  />
                </Form.Field>
              </Grid.Column>

              <Grid.Column>
                <Form.Field>
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label>{t('common.weightTo', { defaultValue: 'Weight To (1-10)' })}</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="10"
                    value={weightTo}
                    onChange={(e) => setWeightTo(e.target.value)}
                  />
                </Form.Field>
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column width={16}>
                <Button primary onClick={handleFilter} loading={isLoading} disabled={isLoading}>
                  {t('action.filter', { defaultValue: 'Filter' })}
                </Button>
                <Button onClick={handleReset} disabled={isLoading}>
                  {t('action.reset', { defaultValue: 'Reset' })}
                </Button>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Form>

        {filteredCards.length > 0 && (
          <Segment className={styles.results}>
            <Header as="h2">
              {t('common.results', { defaultValue: 'Results' })} ({filteredCards.length})
            </Header>
            <div className={styles.cardsList}>
              {filteredCards.map((card) => (
                <Segment key={card.id} className={styles.cardItem}>
                  <Grid>
                    <Grid.Row>
                      <Grid.Column width={12}>
                        <Header as="h3">{card.name}</Header>
                        {card.description && <p>{card.description}</p>}
                      </Grid.Column>
                      <Grid.Column width={4} textAlign="right">
                        <div>
                          <strong>{t('common.type', { defaultValue: 'Type' })}:</strong> {card.type}
                        </div>
                        {card.weight && (
                          <div>
                            <strong>{t('common.weight', { defaultValue: 'Weight' })}:</strong>{' '}
                            {card.weight}
                          </div>
                        )}
                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                      <Grid.Column>
                        {card.startDate && (
                          <span>
                            <strong>{t('common.startDate', { defaultValue: 'Start' })}:</strong>{' '}
                            {new Date(card.startDate).toLocaleDateString()} &nbsp;
                          </span>
                        )}
                        {card.dueDate && (
                          <span>
                            <strong>{t('common.dueDate', { defaultValue: 'Due' })}:</strong>{' '}
                            {new Date(card.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                </Segment>
              ))}
            </div>
          </Segment>
        )}

        {!isLoading && filteredCards.length === 0 && (
          <Segment textAlign="center">
            {t('common.noCardsFound', { defaultValue: 'No cards found. Apply filters to search.' })}
          </Segment>
        )}
      </Segment>
    </div>
  );
}

CardsFilter.propTypes = {
  currentUserId: PropTypes.string.isRequired,
};

export default CardsFilter;
