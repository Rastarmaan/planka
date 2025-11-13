/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/* eslint-disable import/no-extraneous-dependencies */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Grid, Segment, Dropdown, Icon, Checkbox } from 'semantic-ui-react';
import { createSelector } from 'redux-orm';
import ReactDatePicker from 'react-datepicker';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persianEn from 'react-date-object/locales/persian_en';

import classNames from 'classnames';
import api from '../../api';
import selectors from '../../selectors';
import entryActions from '../../entry-actions';
import orm from '../../orm';
import { getTextDirectionStyles } from '../../utils/text-direction';

import styles from './FiltersStep.module.scss';

const selectAllLabels = createSelector(orm, (session) => {
  const { Label } = session;
  const labels = Label.all().orderBy('position').toRefArray();
  return labels;
});

const STORAGE_KEY = 'planka_cards_filter_state';

function FiltersStep() {
  const [t, i18n] = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const accessToken = useSelector(selectors.selectAccessToken);
  const currentUserId = useSelector(selectors.selectCurrentUserId);
  const allLabels = useSelector(selectAllLabels);

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [selectedProjectIds, setSelectedProjectIds] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedLabelIds, setSelectedLabelIds] = useState([]);
  const [isJalali, setIsJalali] = useState(false);
  const [startDateFrom, setStartDateFrom] = useState(null);
  const [startDateTo, setStartDateTo] = useState(null);
  const [dueDateFrom, setDueDateFrom] = useState(null);
  const [dueDateTo, setDueDateTo] = useState(null);
  const [weightFrom, setWeightFrom] = useState('');
  const [weightTo, setWeightTo] = useState('');

  const [filteredCards, setFilteredCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCalendarTypeChange = useCallback((checked) => {
    setIsJalali(checked);
    setStartDateFrom(null);
    setStartDateTo(null);
    setDueDateFrom(null);
    setDueDateTo(null);
  }, []);

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

        setStartDateFrom(parsed.startDateFrom ? new Date(parsed.startDateFrom) : null);
        setStartDateTo(parsed.startDateTo ? new Date(parsed.startDateTo) : null);
        setDueDateFrom(parsed.dueDateFrom ? new Date(parsed.dueDateFrom) : null);
        setDueDateTo(parsed.dueDateTo ? new Date(parsed.dueDateTo) : null);

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
        const fetchedProjects = projectsResponse.items || [];
        setProjects(fetchedProjects);

        if (fetchedProjects.length > 0) {
          await Promise.all(fetchedProjects.map((project) => api.getProject(project.id, headers)));
        }

        const labelsResponse = await api.getAllLabels(headers);

        if (labelsResponse.items && labelsResponse.items.length > 0) {
          labelsResponse.items.forEach((label) => {
            dispatch(entryActions.handleLabelCreate(label));
          });
        }

        const usersResponse = await api.getUsers(headers);
        setUsers(usersResponse.items || []);

        setIsDataLoaded(true);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch filter data:', err);
        setError(err.message);
        setIsDataLoaded(true);
      }
    };

    fetchData();
  }, [getAuthHeaders, dispatch]);

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
    if (startDateFrom) {
      const jsDate = startDateFrom?.toDate ? startDateFrom.toDate() : startDateFrom;
      filters.startDateFrom = jsDate.toISOString();
    }
    if (startDateTo) {
      const jsDate = startDateTo?.toDate ? startDateTo.toDate() : startDateTo;
      const endOfDay = new Date(jsDate);
      endOfDay.setHours(23, 59, 59, 999);
      filters.startDateTo = endOfDay.toISOString();
    }
    if (dueDateFrom) {
      const jsDate = dueDateFrom?.toDate ? dueDateFrom.toDate() : dueDateFrom;
      filters.dueDateFrom = jsDate.toISOString();
    }
    if (dueDateTo) {
      const jsDate = dueDateTo?.toDate ? dueDateTo.toDate() : dueDateTo;
      const endOfDay = new Date(jsDate);
      endOfDay.setHours(23, 59, 59, 999);
      filters.dueDateTo = endOfDay.toISOString();
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

      const cardsWithLabels = (response.items || []).map((card) => {
        const cardLabelRelations = (response.included?.cardLabels || []).filter(
          (cl) => cl.cardId === card.id,
        );
        const cardLabelIds = cardLabelRelations.map((cl) => cl.labelId);
        const cardLabels = (response.included?.labels || []).filter((l) =>
          cardLabelIds.includes(l.id),
        );

        return {
          ...card,
          labels: cardLabels,
        };
      });

      setFilteredCards(cardsWithLabels);
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
      allLabels.map((label) => ({
        key: label.id,
        text: label.name,
        value: label.id,
      })),
    [allLabels],
  );

  const weightOptions = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        key: i + 1,
        text: (i + 1).toString(),
        value: i + 1,
      })),
    [],
  );

  if (!isDataLoaded) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <button type="button" className={classNames(styles.button)} onClick={() => navigate('/')}>
          <Icon fitted name="arrow left" />
          <span className={styles.text}>
            {t('action.backToProjects', { defaultValue: 'Back to Projects' })}
          </span>
        </button>
      </div>

      {error && (
        <Segment color="red" size="mini">
          {error}
        </Segment>
      )}

      <div className={styles.content}>
        <Form>
          <div className={styles.filterGroup}>
            <h3 className={styles.groupTitle}>
              {t('common.projectsAndMembers', { defaultValue: 'Projects & Members' })}
            </h3>
            <Grid columns={3} stackable>
              <Grid.Row>
                <Grid.Column>
                  <Form.Field>
                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                    <label>{t('common.projects', { defaultValue: 'Projects' })}</label>
                    <Dropdown
                      placeholder={t('common.selectProjects', {
                        defaultValue: 'Select Projects',
                      })}
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
              </Grid.Row>
            </Grid>
          </div>

          <div className={styles.filterGroup}>
            <h3 className={styles.groupTitle}>{t('common.dates', { defaultValue: 'Dates' })}</h3>
            <Form.Group inline className={styles.calendarRadio}>
              <Form.Field>
                <Checkbox
                  radio
                  label="Gregorian"
                  name="calendarType"
                  value="gregorian"
                  checked={!isJalali}
                  onChange={() => handleCalendarTypeChange(false)}
                />
              </Form.Field>
              <Form.Field>
                <Checkbox
                  radio
                  label="Jalali"
                  name="calendarType"
                  value="jalali"
                  checked={isJalali}
                  onChange={() => handleCalendarTypeChange(true)}
                />
              </Form.Field>
            </Form.Group>
            <Grid columns={4} stackable>
              <Grid.Row>
                <Grid.Column>
                  <Form.Field>
                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                    <label>{t('common.startDate', { defaultValue: 'Start Date From' })}</label>
                    <div className={styles.datePickerWrapper}>
                      {isJalali ? (
                        <DatePicker
                          value={startDateFrom}
                          onChange={setStartDateFrom}
                          calendar={persian}
                          locale={persianEn}
                          weekStartDayIndex={6}
                          format="YYYY/MM/DD"
                          inputClass={styles.dateInput}
                          placeholder="Select date"
                          containerClassName={styles.datePickerContainer}
                        />
                      ) : (
                        <ReactDatePicker
                          selected={startDateFrom}
                          onChange={setStartDateFrom}
                          dateFormat="MM/dd/yyyy"
                          placeholderText="Select date"
                          className={styles.dateInput}
                        />
                      )}
                    </div>
                  </Form.Field>
                </Grid.Column>

                <Grid.Column>
                  <Form.Field>
                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                    <label>{t('common.to', { defaultValue: 'Start Date To' })}</label>
                    <div className={styles.datePickerWrapper}>
                      {isJalali ? (
                        <DatePicker
                          value={startDateTo}
                          onChange={setStartDateTo}
                          calendar={persian}
                          locale={persianEn}
                          weekStartDayIndex={6}
                          format="YYYY/MM/DD"
                          inputClass={styles.dateInput}
                          placeholder="Select date"
                          containerClassName={styles.datePickerContainer}
                        />
                      ) : (
                        <ReactDatePicker
                          selected={startDateTo}
                          onChange={setStartDateTo}
                          dateFormat="MM/dd/yyyy"
                          placeholderText="Select date"
                          className={styles.dateInput}
                        />
                      )}
                    </div>
                  </Form.Field>
                </Grid.Column>

                <Grid.Column>
                  <Form.Field>
                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                    <label>{t('common.dueDate', { defaultValue: 'Due Date From' })}</label>
                    <div className={styles.datePickerWrapper}>
                      {isJalali ? (
                        <DatePicker
                          value={dueDateFrom}
                          onChange={setDueDateFrom}
                          calendar={persian}
                          locale={persianEn}
                          weekStartDayIndex={6}
                          format="YYYY/MM/DD"
                          inputClass={styles.dateInput}
                          placeholder="Select date"
                          containerClassName={styles.datePickerContainer}
                        />
                      ) : (
                        <ReactDatePicker
                          selected={dueDateFrom}
                          onChange={setDueDateFrom}
                          dateFormat="MM/dd/yyyy"
                          placeholderText="Select date"
                          className={styles.dateInput}
                        />
                      )}
                    </div>
                  </Form.Field>
                </Grid.Column>

                <Grid.Column>
                  <Form.Field>
                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                    <label>{t('common.to', { defaultValue: 'Due Date To' })}</label>
                    <div className={styles.datePickerWrapper}>
                      {isJalali ? (
                        <DatePicker
                          value={dueDateTo}
                          onChange={setDueDateTo}
                          calendar={persian}
                          locale={persianEn}
                          weekStartDayIndex={6}
                          format="YYYY/MM/DD"
                          inputClass={styles.dateInput}
                          placeholder="Select date"
                          containerClassName={styles.datePickerContainer}
                        />
                      ) : (
                        <ReactDatePicker
                          selected={dueDateTo}
                          onChange={setDueDateTo}
                          dateFormat="MM/dd/yyyy"
                          placeholderText="Select date"
                          className={styles.dateInput}
                        />
                      )}
                    </div>
                  </Form.Field>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </div>

          <div className={styles.filterGroup}>
            <h3 className={styles.groupTitle}>{t('common.weight', { defaultValue: 'Weight' })}</h3>
            <Grid columns={2} stackable>
              <Grid.Row>
                <Grid.Column>
                  <Form.Field>
                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                    <label>{t('common.weight', { defaultValue: 'Weight From' })}</label>
                    <Dropdown
                      placeholder={t('action.selectWeight', { defaultValue: 'Select Weight' })}
                      fluid
                      search
                      selection
                      clearable
                      options={weightOptions}
                      value={weightFrom}
                      onChange={(e, { value }) => setWeightFrom(value)}
                    />
                  </Form.Field>
                </Grid.Column>

                <Grid.Column>
                  <Form.Field>
                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                    <label>{t('common.to', { defaultValue: 'Weight To' })}</label>
                    <Dropdown
                      placeholder={t('action.selectWeight', { defaultValue: 'Select Weight' })}
                      fluid
                      search
                      selection
                      clearable
                      options={weightOptions}
                      value={weightTo}
                      onChange={(e, { value }) => setWeightTo(value)}
                    />
                  </Form.Field>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </div>

          <div className={styles.filterGroup}>
            <Grid columns={2} stackable>
              <Grid.Row>
                <Grid.Column>
                  <Form.Field>
                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                    <label>&nbsp;</label>
                    <Button
                      primary
                      fluid
                      onClick={handleFilter}
                      loading={isLoading}
                      disabled={isLoading}
                    >
                      {t('action.filter', { defaultValue: 'Filter' })}
                    </Button>
                  </Form.Field>
                </Grid.Column>

                <Grid.Column>
                  <Form.Field>
                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                    <label>&nbsp;</label>
                    <Button fluid onClick={handleReset} disabled={isLoading}>
                      {t('action.reset', { defaultValue: 'Reset' })}
                    </Button>
                  </Form.Field>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </div>
        </Form>
      </div>

      {filteredCards.length > 0 && (
        <div className={styles.results}>
          <h4 className={styles.groupTitle}>
            {t('common.results', { defaultValue: 'Results' })} ({filteredCards.length})
          </h4>
          <div className={styles.cardsList}>
            {filteredCards.map((card) => {
              const nameDirectionStyles = getTextDirectionStyles(card.name, i18n.language);
              const descriptionDirectionStyles = card.description
                ? getTextDirectionStyles(card.description, i18n.language)
                : {};

              return (
                <div key={card.id} className={styles.cardItem}>
                  <div className={styles.cardContent}>
                    <div className={styles.cardMain}>
                      <div className={styles.cardHeader}>
                        <strong style={nameDirectionStyles}>{card.name}</strong>
                      </div>
                      {card.description && (
                        <p className={styles.cardDescription} style={descriptionDirectionStyles}>
                          {card.description}
                        </p>
                      )}
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
                    {card.labels && card.labels.length > 0 && (
                      <div className={styles.cardLabels}>
                        <strong className={styles.labelTitle}>
                          {t('common.labels', { defaultValue: 'Labels' })}:
                        </strong>
                        <div className={styles.labelsList}>
                          {card.labels.map((label) => (
                            <span
                              key={label.id}
                              className={styles.label}
                              style={{ backgroundColor: label.color }}
                            >
                              {label.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!isLoading && filteredCards.length === 0 && selectedProjectIds.length === 0 && (
        <div className={styles.emptyState}>
          {t('common.selectFiltersToSearch', {
            defaultValue: 'Select filters and click "Filter" to search for cards.',
          })}
        </div>
      )}

      {!isLoading && filteredCards.length === 0 && selectedProjectIds.length > 0 && (
        <div className={styles.emptyState}>
          {t('common.noCardsFound', { defaultValue: 'No cards found matching your filters.' })}
        </div>
      )}
    </div>
  );
}

export default FiltersStep;
