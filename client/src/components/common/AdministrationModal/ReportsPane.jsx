/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */
/* eslint-disable import/no-extraneous-dependencies */
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import DateObject from 'react-date-object';
import persian from 'react-date-object/calendars/persian';
import persianEn from 'react-date-object/locales/persian_en';
import DatePicker from 'react-datepicker';
import JalaliDatePicker from 'react-multi-date-picker';
import {
  Button,
  Confirm,
  Dropdown,
  Form,
  Icon,
  Input,
  Segment,
  Tab,
  Table,
} from 'semantic-ui-react';

import { ReportPhaseStatuses, ReportPhasePermissions } from '../../../constants/Enums';
import { ReportPhaseStatusIcons } from '../../../constants/Icons';
import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';

import styles from './ReportsPane.module.scss';

const ReportsPane = React.memo(() => {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const [calendarType, setCalendarType] = useState('gregorian');
  const [isCreating, setIsCreating] = useState(false);
  const [newReportName, setNewReportName] = useState('');
  const [editingReportId, setEditingReportId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [expandedReportId, setExpandedReportId] = useState(null);
  const [deleteConfirmReport, setDeleteConfirmReport] = useState(null);
  const [deleteConfirmPhase, setDeleteConfirmPhase] = useState(null);
  const [addingPhaseToReportId, setAddingPhaseToReportId] = useState(null);
  const [reportSearchTerm, setReportSearchTerm] = useState('');
  const [phaseSearchTerms, setPhaseSearchTerms] = useState({});
  const [newPhase, setNewPhase] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: ReportPhaseStatuses.TODO,
    projectId: null,
    memberships: [],
  });
  const [editingPhaseId, setEditingPhaseId] = useState(null);
  const [editingPhase, setEditingPhase] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: ReportPhaseStatuses.TODO,
    projectId: null,
    memberships: [],
  });

  const reports = useSelector(selectors.selectAllReports);
  const reportPhases = useSelector(selectors.selectAllReportPhases);
  const allProjects = useSelector(selectors.selectAllProjects);
  const allUsers = useSelector(selectors.selectAllActiveUsers);

  const isJalali = calendarType === 'jalali';

  // Convert ISO date string to Date object for DatePicker
  const parseDateToObject = useCallback((dateString) => {
    if (!dateString) return null;
    // Handle both formats: YYYY-MM-DD and YYYY/MM/DD
    const normalized = dateString.replace(/\//g, '-');
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
  }, []);

  // Convert Date object to ISO string for backend
  const dateToISOString = useCallback((date) => {
    if (!date) return '';
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return '';
  }, []);

  const statusOptions = [
    {
      key: 'todo',
      value: ReportPhaseStatuses.TODO,
      text: t('common.statusTodo'),
      icon: 'circle outline',
    },
    {
      key: 'doing',
      value: ReportPhaseStatuses.DOING,
      text: t('common.statusDoing'),
      icon: 'adjust',
    },
    {
      key: 'done',
      value: ReportPhaseStatuses.DONE,
      text: t('common.statusDone'),
      icon: 'check circle',
    },
  ];

  useEffect(() => {
    // Reports will be loaded via WebSocket on connection
  }, []);

  const getReportPhases = useCallback(
    (reportId) => {
      return reportPhases.filter((phase) => phase.reportId === reportId);
    },
    [reportPhases],
  );

  const filteredReports = React.useMemo(() => {
    if (!reportSearchTerm.trim()) {
      return reports;
    }
    const searchLower = reportSearchTerm.toLowerCase();
    return reports.filter((report) => report.name.toLowerCase().includes(searchLower));
  }, [reports, reportSearchTerm]);

  const getFilteredPhases = useCallback(
    (reportId) => {
      const phases = getReportPhases(reportId);
      const searchTerm = phaseSearchTerms[reportId] || '';
      if (!searchTerm.trim()) {
        return phases;
      }
      const searchLower = searchTerm.toLowerCase();
      return phases.filter(
        (phase) =>
          phase.name.toLowerCase().includes(searchLower) ||
          (phase.description && phase.description.toLowerCase().includes(searchLower)),
      );
    },
    [getReportPhases, phaseSearchTerms],
  );

  const handlePhaseSearchChange = useCallback((reportId, value) => {
    setPhaseSearchTerms((prev) => ({
      ...prev,
      [reportId]: value,
    }));
  }, []);

  const handleCreateClick = useCallback(() => {
    setIsCreating(true);
  }, []);

  const handleCancelCreate = useCallback(() => {
    setIsCreating(false);
    setNewReportName('');
  }, []);

  const handleSubmitCreate = useCallback(() => {
    if (newReportName.trim()) {
      dispatch(entryActions.createReport({ name: newReportName.trim() }));
      setIsCreating(false);
      setNewReportName('');
    }
  }, [newReportName, dispatch]);

  const handleEditClick = useCallback((report) => {
    setEditingReportId(report.id);
    setEditingName(report.name);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingReportId(null);
    setEditingName('');
  }, []);

  const handleSubmitEdit = useCallback(() => {
    if (editingName.trim() && editingReportId) {
      dispatch(
        entryActions.updateReport(editingReportId, {
          name: editingName.trim(),
        }),
      );
      setEditingReportId(null);
      setEditingName('');
    }
  }, [editingName, editingReportId, dispatch]);

  const handleDeleteClick = useCallback((report) => {
    setDeleteConfirmReport(report);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirmReport) {
      dispatch(entryActions.deleteReport(deleteConfirmReport.id));
      if (expandedReportId === deleteConfirmReport.id) {
        setExpandedReportId(null);
      }
      setDeleteConfirmReport(null);
    }
  }, [dispatch, expandedReportId, deleteConfirmReport]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmReport(null);
  }, []);

  const handleExpandClick = useCallback((reportId) => {
    setExpandedReportId((prev) => (prev === reportId ? null : reportId));
  }, []);

  const handleAddPhaseClick = useCallback((reportId) => {
    setAddingPhaseToReportId(reportId);
    setNewPhase({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: ReportPhaseStatuses.TODO,
      projectId: null,
      memberships: [],
    });
  }, []);

  const handleCancelAddPhase = useCallback(() => {
    setAddingPhaseToReportId(null);
    setNewPhase({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: ReportPhaseStatuses.TODO,
      projectId: null,
      memberships: [],
    });
  }, []);

  const handleSubmitAddPhase = useCallback(() => {
    if (newPhase.name.trim() && addingPhaseToReportId) {
      const phases = getReportPhases(addingPhaseToReportId);
      dispatch(
        entryActions.createReportPhase(addingPhaseToReportId, {
          name: newPhase.name.trim(),
          description: newPhase.description.trim(),
          startDate: newPhase.startDate || null,
          endDate: newPhase.endDate || null,
          status: newPhase.status,
          project: newPhase.projectId || null,
          position: phases.length,
          memberships: newPhase.memberships,
        }),
      );
      setAddingPhaseToReportId(null);
      setNewPhase({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: ReportPhaseStatuses.TODO,
        projectId: null,
        memberships: [],
      });
    }
  }, [newPhase, addingPhaseToReportId, dispatch, getReportPhases]);

  const handleEditPhaseClick = useCallback(
    (phase) => {
      const phaseModel = reportPhases.find((p) => p.id === phase.id);

      if (!phaseModel) return;

      const memberships = phaseModel.memberships
        ? phaseModel.memberships.toRefArray().map((m) => ({
            userId: m.userId,
            permission: m.permission,
          }))
        : [];

      setEditingPhaseId(phaseModel.id);
      setEditingPhase({
        name: phaseModel.name,
        description: phaseModel.description || '',
        startDate: phaseModel.startDate || '',
        endDate: phaseModel.endDate || '',
        status: phaseModel.status,
        projectId: phaseModel.projectId || null,
        memberships,
      });
    },
    [reportPhases],
  );

  const handleCancelEditPhase = useCallback(() => {
    setEditingPhaseId(null);
    setEditingPhase({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: ReportPhaseStatuses.TODO,
      projectId: null,
      memberships: [],
    });
  }, []);

  const handleSubmitEditPhase = useCallback(() => {
    if (editingPhase.name.trim() && editingPhaseId) {
      dispatch(
        entryActions.updateReportPhase(editingPhaseId, {
          name: editingPhase.name.trim(),
          description: editingPhase.description.trim(),
          startDate: editingPhase.startDate || null,
          endDate: editingPhase.endDate || null,
          status: editingPhase.status,
          project: editingPhase.projectId || null,
          memberships: editingPhase.memberships,
        }),
      );
      setEditingPhaseId(null);
      setEditingPhase({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: ReportPhaseStatuses.TODO,
        projectId: null,
        memberships: [],
      });
    }
  }, [editingPhase, editingPhaseId, dispatch]);

  const handleDeletePhaseClick = useCallback((phase) => {
    setDeleteConfirmPhase(phase);
  }, []);

  const handleConfirmDeletePhase = useCallback(() => {
    if (deleteConfirmPhase) {
      dispatch(entryActions.deleteReportPhase(deleteConfirmPhase.id));
      setDeleteConfirmPhase(null);
    }
  }, [dispatch, deleteConfirmPhase]);

  const handleCancelDeletePhase = useCallback(() => {
    setDeleteConfirmPhase(null);
  }, []);

  const formatDate = useCallback(
    (date) => {
      if (!date) return '-';
      const dateObj = parseDateToObject(date);
      if (!dateObj) return '-';

      if (isJalali) {
        const jalaliDate = new DateObject({
          date: dateObj,
          calendar: persian,
          locale: persianEn,
        });
        return jalaliDate.format('YYYY/MM/DD');
      }
      return dateObj.toISOString().split('T')[0];
    },
    [isJalali, parseDateToObject],
  );

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <div className={styles.header}>
        <h3>{t('common.reports')}</h3>
        <div className={styles.headerActions}>
          <Button.Group size="tiny">
            <Button
              active={calendarType === 'gregorian'}
              onClick={() => setCalendarType('gregorian')}
            >
              Gregorian
            </Button>
            <Button active={calendarType === 'jalali'} onClick={() => setCalendarType('jalali')}>
              Jalali
            </Button>
          </Button.Group>
          <Button primary size="small" onClick={handleCreateClick}>
            <Icon name="plus" />
            {t('action.addReport')}
          </Button>
        </div>
      </div>

      {isCreating && (
        <Segment>
          <Form onSubmit={handleSubmitCreate}>
            <Form.Field>
              <Input
                autoFocus
                placeholder={t('common.reportName')}
                value={newReportName}
                onChange={(e) => setNewReportName(e.target.value)}
              />
            </Form.Field>
            <Button.Group>
              <Button type="submit" positive>
                {t('action.create')}
              </Button>
              <Button type="button" onClick={handleCancelCreate}>
                {t('action.cancel')}
              </Button>
            </Button.Group>
          </Form>
        </Segment>
      )}

      {reports.length === 0 && !isCreating && (
        <Segment placeholder className={styles.emptyState}>
          <div className={styles.emptyStateContent}>
            <Icon name="file alternate outline" size="huge" />
            <h4>{t('common.noReportsYet')}</h4>
            <Button primary onClick={handleCreateClick}>
              <Icon name="plus" />
              {t('action.addReport')}
            </Button>
          </div>
        </Segment>
      )}

      {reports.length > 0 && (
        <>
          <div className={styles.searchBox}>
            <Input
              icon="search"
              placeholder={t('common.searchReports')}
              value={reportSearchTerm}
              onChange={(e) => setReportSearchTerm(e.target.value)}
              fluid
            />
          </div>
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width={1} />
                <Table.HeaderCell>{t('common.name')}</Table.HeaderCell>
                <Table.HeaderCell width={2}>{t('common.actions')}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredReports.map((report) => {
                const phases = getReportPhases(report.id);
                const filteredPhases = getFilteredPhases(report.id);
                const isExpanded = expandedReportId === report.id;
                const isEditing = editingReportId === report.id;
                const isAddingPhase = addingPhaseToReportId === report.id;

                return (
                  <React.Fragment key={report.id}>
                    <Table.Row>
                      <Table.Cell>
                        <Icon
                          name={isExpanded ? 'caret down' : 'caret right'}
                          link
                          onClick={() => handleExpandClick(report.id)}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        {isEditing ? (
                          <Input
                            fluid
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                          />
                        ) : (
                          report.name
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        {isEditing ? (
                          <Button.Group size="small">
                            <Button positive onClick={handleSubmitEdit}>
                              {t('action.save')}
                            </Button>
                            <Button onClick={handleCancelEdit}>{t('action.cancel')}</Button>
                          </Button.Group>
                        ) : (
                          <Button.Group size="small">
                            <Button icon onClick={() => handleEditClick(report)}>
                              <Icon name="pencil" />
                            </Button>
                            <Button icon negative onClick={() => handleDeleteClick(report)}>
                              <Icon name="trash" />
                            </Button>
                          </Button.Group>
                        )}
                      </Table.Cell>
                    </Table.Row>

                    {isExpanded && (
                      <Table.Row>
                        <Table.Cell colSpan={3} className={styles.phasesCell}>
                          <div className={styles.phasesSection}>
                            <div className={styles.phasesHeader}>
                              <h4>{t('common.phases')}</h4>
                              <Button size="tiny" onClick={() => handleAddPhaseClick(report.id)}>
                                <Icon name="plus" />
                                {t('action.addPhase')}
                              </Button>
                            </div>

                            {phases.length > 0 && (
                              <div className={styles.phaseSearchBox}>
                                <Input
                                  icon="search"
                                  placeholder={t('common.searchPhases')}
                                  value={phaseSearchTerms[report.id] || ''}
                                  onChange={(e) =>
                                    handlePhaseSearchChange(report.id, e.target.value)
                                  }
                                  size="small"
                                  fluid
                                />
                              </div>
                            )}

                            {isAddingPhase && (
                              <Segment>
                                <Form onSubmit={handleSubmitAddPhase}>
                                  <Form.Group widths="equal">
                                    <Form.Field>
                                      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                                      <label>{t('common.name')}</label>
                                      <Input
                                        value={newPhase.name}
                                        onChange={(e) =>
                                          setNewPhase({
                                            ...newPhase,
                                            name: e.target.value,
                                          })
                                        }
                                      />
                                    </Form.Field>
                                    <Form.Field>
                                      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                                      <label>{t('common.status')}</label>
                                      <Dropdown
                                        selection
                                        value={newPhase.status}
                                        options={statusOptions}
                                        onChange={(_, { value }) =>
                                          setNewPhase({
                                            ...newPhase,
                                            status: value,
                                          })
                                        }
                                      />
                                    </Form.Field>
                                  </Form.Group>
                                  <Form.Field>
                                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                                    <label>{t('common.description')}</label>
                                    <Input
                                      value={newPhase.description}
                                      onChange={(e) =>
                                        setNewPhase({
                                          ...newPhase,
                                          description: e.target.value,
                                        })
                                      }
                                    />
                                  </Form.Field>
                                  <Form.Group widths="equal">
                                    <Form.Field>
                                      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                                      <label>{t('common.startDate')}</label>
                                      {isJalali ? (
                                        <JalaliDatePicker
                                          value={
                                            newPhase.startDate
                                              ? new DateObject(
                                                  parseDateToObject(newPhase.startDate),
                                                ).convert(persian, persianEn)
                                              : null
                                          }
                                          onChange={(dateObj) => {
                                            const date = dateObj?.toDate?.();
                                            setNewPhase({
                                              ...newPhase,
                                              startDate: date ? dateToISOString(date) : '',
                                            });
                                          }}
                                          format="YYYY/MM/DD"
                                          calendar={persian}
                                          locale={persianEn}
                                          placeholder="YYYY/MM/DD"
                                          calendarPosition="bottom-center"
                                          inputClass={styles.datePickerInput}
                                        />
                                      ) : (
                                        <DatePicker
                                          selected={parseDateToObject(newPhase.startDate)}
                                          onChange={(date) =>
                                            setNewPhase({
                                              ...newPhase,
                                              startDate: date ? dateToISOString(date) : '',
                                            })
                                          }
                                          dateFormat="yyyy-MM-dd"
                                          placeholderText="YYYY-MM-DD"
                                          className="ui input"
                                        />
                                      )}
                                    </Form.Field>
                                    <Form.Field>
                                      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                                      <label>{t('common.endDate')}</label>
                                      {isJalali ? (
                                        <JalaliDatePicker
                                          value={
                                            newPhase.endDate
                                              ? new DateObject(
                                                  parseDateToObject(newPhase.endDate),
                                                ).convert(persian, persianEn)
                                              : null
                                          }
                                          onChange={(dateObj) => {
                                            const date = dateObj?.toDate?.();
                                            setNewPhase({
                                              ...newPhase,
                                              endDate: date ? dateToISOString(date) : '',
                                            });
                                          }}
                                          format="YYYY/MM/DD"
                                          calendar={persian}
                                          locale={persianEn}
                                          placeholder="YYYY/MM/DD"
                                          calendarPosition="bottom-center"
                                          inputClass={styles.datePickerInput}
                                        />
                                      ) : (
                                        <DatePicker
                                          selected={parseDateToObject(newPhase.endDate)}
                                          onChange={(date) =>
                                            setNewPhase({
                                              ...newPhase,
                                              endDate: date ? dateToISOString(date) : '',
                                            })
                                          }
                                          dateFormat="yyyy-MM-dd"
                                          placeholderText="YYYY-MM-DD"
                                          className="ui input"
                                        />
                                      )}
                                    </Form.Field>
                                  </Form.Group>
                                  <Form.Field>
                                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                                    <label>{t('common.assignProject')}</label>
                                    <Dropdown
                                      selection
                                      clearable
                                      placeholder={t('common.selectProject')}
                                      value={newPhase.projectId || undefined}
                                      options={allProjects.map((project) => ({
                                        key: project.id,
                                        value: project.id,
                                        text: project.name,
                                      }))}
                                      onChange={(_, { value }) =>
                                        setNewPhase({
                                          ...newPhase,
                                          projectId: value || null,
                                        })
                                      }
                                    />
                                  </Form.Field>
                                  <Form.Field>
                                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                                    <label>{t('common.assignPeople')}</label>
                                    <Dropdown
                                      selection
                                      multiple
                                      search
                                      placeholder={t('common.selectUsers')}
                                      value={newPhase.memberships.map((m) => m.userId)}
                                      options={allUsers.map((user) => ({
                                        key: user.id,
                                        value: user.id,
                                        text: user.name || user.username || user.email,
                                        image: {
                                          avatar: true,
                                          src: (() => {
                                            if (
                                              user.avatarUrl &&
                                              user.avatarUrl.indexOf('http') === 0
                                            ) {
                                              return user.avatarUrl;
                                            }
                                            if (user.avatarUrl) {
                                              return `${window.location.origin}${user.avatarUrl}`;
                                            }
                                            return `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                              user.name || user.username || user.email,
                                            )}&background=random`;
                                          })(),
                                        },
                                      }))}
                                      onChange={(_, { value }) => {
                                        const selectedUserIds = value;
                                        const currentMemberships = newPhase.memberships;

                                        const newMemberships = selectedUserIds.map((userId) => {
                                          const existing = currentMemberships.find(
                                            (m) => m.userId === userId,
                                          );
                                          return {
                                            userId,
                                            permission:
                                              existing?.permission || ReportPhasePermissions.VIEW,
                                          };
                                        });

                                        setNewPhase({
                                          ...newPhase,
                                          memberships: newMemberships,
                                        });
                                      }}
                                    />
                                    {newPhase.memberships.length > 0 && (
                                      <div className={styles.membershipsList}>
                                        {newPhase.memberships.map((membership) => {
                                          const user = allUsers.find(
                                            (u) => u.id === membership.userId,
                                          );
                                          if (!user) return null;

                                          return (
                                            <div
                                              key={membership.userId}
                                              className={styles.membershipItem}
                                            >
                                              <div className={styles.membershipUser}>
                                                <img
                                                  className={styles.membershipAvatar}
                                                  src={(() => {
                                                    if (
                                                      user.avatarUrl &&
                                                      user.avatarUrl.indexOf('http') === 0
                                                    ) {
                                                      return user.avatarUrl;
                                                    }
                                                    if (user.avatarUrl) {
                                                      return `${window.location.origin}${user.avatarUrl}`;
                                                    }
                                                    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                      user.name || user.username || user.email,
                                                    )}&background=random`;
                                                  })()}
                                                  alt={user.name || user.username}
                                                />
                                                <span>
                                                  {user.name || user.username || user.email}
                                                </span>
                                              </div>
                                              <div className={styles.membershipActions}>
                                                <Dropdown
                                                  selection
                                                  compact
                                                  value={
                                                    membership.permission ||
                                                    ReportPhasePermissions.VIEW
                                                  }
                                                  options={[
                                                    {
                                                      key: 'view',
                                                      value: ReportPhasePermissions.VIEW,
                                                      text: t('common.permissionView'),
                                                    },
                                                    {
                                                      key: 'edit',
                                                      value: ReportPhasePermissions.EDIT,
                                                      text: t('common.permissionEdit'),
                                                    },
                                                  ]}
                                                  onChange={(_, { value }) => {
                                                    const updated = newPhase.memberships.map((m) =>
                                                      m.userId === membership.userId
                                                        ? { ...m, permission: value }
                                                        : m,
                                                    );
                                                    setNewPhase({
                                                      ...newPhase,
                                                      memberships: updated,
                                                    });
                                                  }}
                                                />
                                                <Button
                                                  icon
                                                  size="tiny"
                                                  onClick={() => {
                                                    setNewPhase({
                                                      ...newPhase,
                                                      memberships: newPhase.memberships.filter(
                                                        (m) => m.userId !== membership.userId,
                                                      ),
                                                    });
                                                  }}
                                                >
                                                  <Icon name="trash" />
                                                </Button>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </Form.Field>
                                  <Button.Group>
                                    <Button type="submit" positive>
                                      {t('action.add')}
                                    </Button>
                                    <Button type="button" onClick={handleCancelAddPhase}>
                                      {t('action.cancel')}
                                    </Button>
                                  </Button.Group>
                                </Form>
                              </Segment>
                            )}

                            {filteredPhases.length === 0 && phases.length === 0 && (
                              <p className={styles.noPhasesText}>{t('common.noPhasesYet')}</p>
                            )}

                            {filteredPhases.length === 0 && phases.length > 0 && (
                              <p className={styles.noPhasesText}>{t('common.noMatchingPhases')}</p>
                            )}

                            {filteredPhases.length > 0 && (
                              <div style={{ overflowX: 'auto' }}>
                                <Table compact celled>
                                  <Table.Header>
                                    <Table.Row>
                                      <Table.HeaderCell width={2}>
                                        {t('common.name')}
                                      </Table.HeaderCell>
                                      <Table.HeaderCell width={3}>
                                        {t('common.description')}
                                      </Table.HeaderCell>
                                      <Table.HeaderCell width={2}>
                                        {t('common.project')}
                                      </Table.HeaderCell>
                                      <Table.HeaderCell width={2}>
                                        {t('common.assignedPeople')}
                                      </Table.HeaderCell>
                                      <Table.HeaderCell width={2}>
                                        {t('common.status')}
                                      </Table.HeaderCell>
                                      <Table.HeaderCell width={2}>
                                        {t('common.startDate')}
                                      </Table.HeaderCell>
                                      <Table.HeaderCell width={2}>
                                        {t('common.endDate')}
                                      </Table.HeaderCell>
                                      <Table.HeaderCell width={2}>
                                        {t('common.actions')}
                                      </Table.HeaderCell>
                                    </Table.Row>
                                  </Table.Header>
                                  <Table.Body>
                                    {filteredPhases.map((phase) => {
                                      const isEditingPhase = editingPhaseId === phase.id;

                                      return (
                                        <React.Fragment key={phase.id}>
                                          <Table.Row>
                                            <Table.Cell>
                                              {isEditingPhase ? (
                                                <Input
                                                  fluid
                                                  size="small"
                                                  value={editingPhase.name}
                                                  onChange={(e) =>
                                                    setEditingPhase({
                                                      ...editingPhase,
                                                      name: e.target.value,
                                                    })
                                                  }
                                                />
                                              ) : (
                                                phase.name
                                              )}
                                            </Table.Cell>
                                            <Table.Cell>
                                              {isEditingPhase ? (
                                                <Input
                                                  fluid
                                                  size="small"
                                                  value={editingPhase.description}
                                                  onChange={(e) =>
                                                    setEditingPhase({
                                                      ...editingPhase,
                                                      description: e.target.value,
                                                    })
                                                  }
                                                />
                                              ) : (
                                                phase.description || '-'
                                              )}
                                            </Table.Cell>
                                            <Table.Cell>
                                              {phase.projectId
                                                ? allProjects.find((p) => p.id === phase.projectId)
                                                    ?.name || '-'
                                                : '-'}
                                            </Table.Cell>
                                            <Table.Cell>
                                              {(() => {
                                                const phaseModel = reportPhases.find(
                                                  (p) => p.id === phase.id,
                                                );
                                                const memberships = phaseModel?.memberships
                                                  ? phaseModel.memberships.toRefArray()
                                                  : [];

                                                if (memberships.length === 0) {
                                                  return '-';
                                                }

                                                const userNames = memberships
                                                  .map((membership) => {
                                                    const user = allUsers.find(
                                                      (u) => u.id === membership.userId,
                                                    );
                                                    return user
                                                      ? `${user.name || user.username || user.email} (${membership.permission})`
                                                      : null;
                                                  })
                                                  .filter(Boolean)
                                                  .join('\n');

                                                return (
                                                  <span title={userNames}>
                                                    {memberships.length}{' '}
                                                    {memberships.length === 1
                                                      ? t('common.member')
                                                      : t('common.members')}
                                                  </span>
                                                );
                                              })()}
                                            </Table.Cell>
                                            <Table.Cell>
                                              {isEditingPhase ? (
                                                <Dropdown
                                                  fluid
                                                  selection
                                                  value={editingPhase.status}
                                                  options={statusOptions}
                                                  onChange={(_, { value }) =>
                                                    setEditingPhase({
                                                      ...editingPhase,
                                                      status: value,
                                                    })
                                                  }
                                                />
                                              ) : (
                                                <>
                                                  <Icon
                                                    name={ReportPhaseStatusIcons[phase.status]}
                                                  />
                                                  {t(`common.status${phase.status}`)}
                                                </>
                                              )}
                                            </Table.Cell>
                                            <Table.Cell>
                                              {!isEditingPhase && formatDate(phase.startDate)}
                                              {isEditingPhase && isJalali && (
                                                <JalaliDatePicker
                                                  value={
                                                    editingPhase.startDate
                                                      ? new DateObject(
                                                          parseDateToObject(editingPhase.startDate),
                                                        ).convert(persian, persianEn)
                                                      : null
                                                  }
                                                  onChange={(dateObj) => {
                                                    const date = dateObj?.toDate?.();
                                                    setEditingPhase({
                                                      ...editingPhase,
                                                      startDate: date ? dateToISOString(date) : '',
                                                    });
                                                  }}
                                                  format="YYYY/MM/DD"
                                                  calendar={persian}
                                                  locale={persianEn}
                                                  placeholder="YYYY/MM/DD"
                                                  calendarPosition="bottom-center"
                                                  inputClass={styles.datePickerInput}
                                                />
                                              )}
                                              {isEditingPhase && !isJalali && (
                                                <DatePicker
                                                  selected={parseDateToObject(
                                                    editingPhase.startDate,
                                                  )}
                                                  onChange={(date) =>
                                                    setEditingPhase({
                                                      ...editingPhase,
                                                      startDate: date ? dateToISOString(date) : '',
                                                    })
                                                  }
                                                  dateFormat="yyyy-MM-dd"
                                                  placeholderText="YYYY-MM-DD"
                                                  className="ui input small"
                                                />
                                              )}
                                            </Table.Cell>
                                            <Table.Cell>
                                              {!isEditingPhase && formatDate(phase.endDate)}
                                              {isEditingPhase && isJalali && (
                                                <JalaliDatePicker
                                                  value={
                                                    editingPhase.endDate
                                                      ? new DateObject(
                                                          parseDateToObject(editingPhase.endDate),
                                                        ).convert(persian, persianEn)
                                                      : null
                                                  }
                                                  onChange={(dateObj) => {
                                                    const date = dateObj?.toDate?.();
                                                    setEditingPhase({
                                                      ...editingPhase,
                                                      endDate: date ? dateToISOString(date) : '',
                                                    });
                                                  }}
                                                  format="YYYY/MM/DD"
                                                  calendar={persian}
                                                  locale={persianEn}
                                                  placeholder="YYYY/MM/DD"
                                                  calendarPosition="bottom-center"
                                                  inputClass={styles.datePickerInput}
                                                />
                                              )}
                                              {isEditingPhase && !isJalali && (
                                                <DatePicker
                                                  selected={parseDateToObject(editingPhase.endDate)}
                                                  onChange={(date) =>
                                                    setEditingPhase({
                                                      ...editingPhase,
                                                      endDate: date ? dateToISOString(date) : '',
                                                    })
                                                  }
                                                  dateFormat="yyyy-MM-dd"
                                                  placeholderText="YYYY-MM-DD"
                                                  className="ui input small"
                                                />
                                              )}
                                            </Table.Cell>
                                            <Table.Cell>
                                              {isEditingPhase ? (
                                                <Button.Group size="tiny">
                                                  <Button positive onClick={handleSubmitEditPhase}>
                                                    {t('action.save')}
                                                  </Button>
                                                  <Button onClick={handleCancelEditPhase}>
                                                    {t('action.cancel')}
                                                  </Button>
                                                </Button.Group>
                                              ) : (
                                                <Button.Group size="tiny">
                                                  <Button
                                                    icon
                                                    onClick={() => handleEditPhaseClick(phase)}
                                                  >
                                                    <Icon name="pencil" />
                                                  </Button>
                                                  <Button
                                                    icon
                                                    negative
                                                    onClick={() => handleDeletePhaseClick(phase)}
                                                  >
                                                    <Icon name="trash" />
                                                  </Button>
                                                </Button.Group>
                                              )}
                                            </Table.Cell>
                                          </Table.Row>
                                          {isEditingPhase && (
                                            <Table.Row key={`${phase.id}-edit-details`}>
                                              <Table.Cell colSpan={8}>
                                                <Segment>
                                                  <Form>
                                                    <Form.Field>
                                                      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                                                      <label>{t('common.assignProject')}</label>
                                                      <Dropdown
                                                        selection
                                                        clearable
                                                        search
                                                        placeholder={t('common.selectProject')}
                                                        value={editingPhase.projectId || undefined}
                                                        options={allProjects.map((project) => ({
                                                          key: project.id,
                                                          value: project.id,
                                                          text: project.name,
                                                        }))}
                                                        onChange={(_, { value }) =>
                                                          setEditingPhase({
                                                            ...editingPhase,
                                                            projectId: value || null,
                                                          })
                                                        }
                                                      />
                                                    </Form.Field>
                                                    <Form.Field>
                                                      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                                                      <label>{t('common.assignPeople')}</label>
                                                      <Dropdown
                                                        selection
                                                        multiple
                                                        search
                                                        placeholder={t('common.selectUsers')}
                                                        value={editingPhase.memberships.map(
                                                          (m) => m.userId,
                                                        )}
                                                        options={allUsers.map((user) => ({
                                                          key: user.id,
                                                          value: user.id,
                                                          text:
                                                            user.name ||
                                                            user.username ||
                                                            user.email,
                                                          image: {
                                                            avatar: true,
                                                            src: (() => {
                                                              if (
                                                                user.avatarUrl &&
                                                                user.avatarUrl.indexOf('http') === 0
                                                              ) {
                                                                return user.avatarUrl;
                                                              }
                                                              if (user.avatarUrl) {
                                                                return `${window.location.origin}${user.avatarUrl}`;
                                                              }
                                                              return `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                                user.name ||
                                                                  user.username ||
                                                                  user.email,
                                                              )}&background=random`;
                                                            })(),
                                                          },
                                                        }))}
                                                        onChange={(_, { value }) => {
                                                          const selectedUserIds = value;
                                                          const currentMemberships =
                                                            editingPhase.memberships;

                                                          const newMemberships =
                                                            selectedUserIds.map((userId) => {
                                                              const existing =
                                                                currentMemberships.find(
                                                                  (m) => m.userId === userId,
                                                                );
                                                              return {
                                                                userId,
                                                                permission:
                                                                  existing?.permission ||
                                                                  ReportPhasePermissions.VIEW,
                                                              };
                                                            });

                                                          setEditingPhase({
                                                            ...editingPhase,
                                                            memberships: newMemberships,
                                                          });
                                                        }}
                                                      />
                                                      {editingPhase.memberships.length > 0 && (
                                                        <div className={styles.membershipsList}>
                                                          {editingPhase.memberships.map(
                                                            (membership) => {
                                                              const user = allUsers.find(
                                                                (u) => u.id === membership.userId,
                                                              );
                                                              if (!user) return null;

                                                              return (
                                                                <div
                                                                  key={membership.userId}
                                                                  className={styles.membershipItem}
                                                                >
                                                                  <div
                                                                    className={
                                                                      styles.membershipUser
                                                                    }
                                                                  >
                                                                    <img
                                                                      className={
                                                                        styles.membershipAvatar
                                                                      }
                                                                      src={(() => {
                                                                        if (
                                                                          user.avatarUrl &&
                                                                          user.avatarUrl.indexOf(
                                                                            'http',
                                                                          ) === 0
                                                                        ) {
                                                                          return user.avatarUrl;
                                                                        }
                                                                        if (user.avatarUrl) {
                                                                          return `${window.location.origin}${user.avatarUrl}`;
                                                                        }
                                                                        return `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                                          user.name ||
                                                                            user.username ||
                                                                            user.email,
                                                                        )}&background=random`;
                                                                      })()}
                                                                      alt={
                                                                        user.name || user.username
                                                                      }
                                                                    />
                                                                    <span>
                                                                      {user.name ||
                                                                        user.username ||
                                                                        user.email}
                                                                    </span>
                                                                  </div>
                                                                  <div
                                                                    className={
                                                                      styles.membershipActions
                                                                    }
                                                                  >
                                                                    <Dropdown
                                                                      selection
                                                                      compact
                                                                      value={
                                                                        membership.permission ||
                                                                        ReportPhasePermissions.VIEW
                                                                      }
                                                                      options={[
                                                                        {
                                                                          key: 'view',
                                                                          value:
                                                                            ReportPhasePermissions.VIEW,
                                                                          text: t(
                                                                            'common.permissionView',
                                                                          ),
                                                                        },
                                                                        {
                                                                          key: 'edit',
                                                                          value:
                                                                            ReportPhasePermissions.EDIT,
                                                                          text: t(
                                                                            'common.permissionEdit',
                                                                          ),
                                                                        },
                                                                      ]}
                                                                      onChange={(_, { value }) => {
                                                                        const updated =
                                                                          editingPhase.memberships.map(
                                                                            (m) =>
                                                                              m.userId ===
                                                                              membership.userId
                                                                                ? {
                                                                                    ...m,
                                                                                    permission:
                                                                                      value,
                                                                                  }
                                                                                : m,
                                                                          );
                                                                        setEditingPhase({
                                                                          ...editingPhase,
                                                                          memberships: updated,
                                                                        });
                                                                      }}
                                                                    />
                                                                    <Button
                                                                      icon
                                                                      size="tiny"
                                                                      onClick={() => {
                                                                        setEditingPhase({
                                                                          ...editingPhase,
                                                                          memberships:
                                                                            editingPhase.memberships.filter(
                                                                              (m) =>
                                                                                m.userId !==
                                                                                membership.userId,
                                                                            ),
                                                                        });
                                                                      }}
                                                                    >
                                                                      <Icon name="trash" />
                                                                    </Button>
                                                                  </div>
                                                                </div>
                                                              );
                                                            },
                                                          )}
                                                        </div>
                                                      )}
                                                    </Form.Field>
                                                  </Form>
                                                </Segment>
                                              </Table.Cell>
                                            </Table.Row>
                                          )}
                                        </React.Fragment>
                                      );
                                    })}
                                  </Table.Body>
                                </Table>
                              </div>
                            )}
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </React.Fragment>
                );
              })}
            </Table.Body>
          </Table>
        </>
      )}

      <Confirm
        open={!!deleteConfirmReport}
        content={t('common.areYouSureYouWantToDeleteThisReport')}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />

      <Confirm
        open={!!deleteConfirmPhase}
        content={t('common.areYouSureYouWantToDeleteThisPhase')}
        onCancel={handleCancelDeletePhase}
        onConfirm={handleConfirmDeletePhase}
      />
    </Tab.Pane>
  );
});

export default ReportsPane;
