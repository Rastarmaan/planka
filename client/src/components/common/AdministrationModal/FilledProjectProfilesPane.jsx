/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */
/* eslint-disable import/no-extraneous-dependencies */
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import DateObject from 'react-date-object';
import persian from 'react-date-object/calendars/persian';
import persianEn from 'react-date-object/locales/persian_en';
import DatePicker from 'react-datepicker';
import JalaliDatePicker from 'react-multi-date-picker';
import {
  Button,
  Form,
  Header,
  Select,
  Segment,
  Input,
  Message,
  Dropdown,
  Table,
} from 'semantic-ui-react';

import {
  selectAllProjectProfiles,
  selectSectionsByProfileId,
  selectFieldsBySectionId,
  selectProjectProfileDataByProjectId,
  selectProjectsWithProfileData,
} from '../../../selectors/projectProfiles';
import { selectAllProjects } from '../../../selectors/projects';
import entryActions from '../../../entry-actions';
import api from '../../../api';

import styles from './FilledProjectProfilesPane.module.scss';
import 'react-datepicker/dist/react-datepicker.css';

const FilledProjectProfilesPane = React.memo(() => {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const projects = useSelector(selectAllProjects);
  const allProfiles = useSelector(selectAllProjectProfiles);
  const templates = allProfiles.filter((profile) => profile.isTemplate);
  const projectsWithProfiles = useSelector(selectProjectsWithProfileData);

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    templates.length > 0 ? templates[0].id : null,
  );
  const [showAssignedList, setShowAssignedList] = useState(false);

  const selectedTemplate = allProfiles.find((p) => p.id === selectedTemplateId);
  const sections = useSelector((state) =>
    selectedTemplateId ? selectSectionsByProfileId(state, selectedTemplateId) : [],
  );

  const [fieldValues, setFieldValues] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);

  const profileData = useSelector((state) =>
    selectedProjectId ? selectProjectProfileDataByProjectId(state, selectedProjectId) : [],
  );

  // Initial load of all project profile data on mount
  useEffect(() => {
    if (!isInitialLoadDone && projects.length > 0) {
      // Load profile data for all projects to populate the assigned list
      projects.forEach((project) => {
        dispatch(entryActions.loadProjectProfileData(project.id));
      });
      setIsInitialLoadDone(true);
    }
  }, [projects, isInitialLoadDone, dispatch]);

  // Load existing data from Redux store
  useEffect(() => {
    if (selectedProjectId) {
      dispatch(entryActions.loadProjectProfileData(selectedProjectId));
    }
  }, [selectedProjectId, dispatch]);

  // Load all project profile data when showing assigned list
  useEffect(() => {
    if (showAssignedList) {
      // Load profile data for all projects that have profiles
      projectsWithProfiles.forEach((item) => {
        dispatch(entryActions.loadProjectProfileData(item.projectId));
      });
    }
  }, [showAssignedList, projectsWithProfiles, dispatch]);

  // Update fieldValues when profileData changes
  useEffect(() => {
    if (!selectedProjectId) {
      return;
    }

    if (profileData && profileData.length > 0) {
      const loadedValues = {};
      profileData.forEach((item) => {
        loadedValues[item.fieldId] = item.value;
      });
      setFieldValues(loadedValues);
    } else {
      setFieldValues({});
    }
  }, [profileData, selectedProjectId]);

  const handleProjectChange = useCallback((_, { value }) => {
    setSelectedProjectId(value);
    setFieldValues({});
    setSaveSuccess(false);
  }, []);

  const handleTemplateChange = useCallback((_, { value }) => {
    setSelectedTemplateId(value);
    setFieldValues({});
    setSaveSuccess(false);
  }, []);

  const handleFieldChange = useCallback((fieldId, value) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    setSaveSuccess(false);
  }, []);

  const handleSave = useCallback(() => {
    if (!selectedProjectId) return;

    setIsSaving(true);
    setSaveSuccess(false);

    dispatch(
      entryActions.saveProjectProfileData(selectedProjectId, selectedTemplateId, fieldValues),
    );

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsSaving(false);
    }, 3000);
  }, [dispatch, selectedProjectId, selectedTemplateId, fieldValues]);

  const projectOptions = projects.map((project) => ({
    key: project.id,
    value: project.id,
    text: project.name,
  }));

  const templateOptions = templates.map((profile) => ({
    key: profile.id,
    value: profile.id,
    text: profile.name,
  }));

  if (templates.length === 0) {
    return (
      <Segment>
        <Header as="h3">{t('common.projectProfiles')}</Header>
        <p>{t('common.noProfileTemplatesAvailable')}</p>
      </Segment>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <Header as="h3">{t('common.projectProfiles')}</Header>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Button
            size="small"
            onClick={() => setShowAssignedList(!showAssignedList)}
            basic={!showAssignedList}
            primary={showAssignedList}
          >
            {showAssignedList ? t('action.createProfile') : t('common.viewAssignedProfiles')}
          </Button>
        </div>
      </div>

      {showAssignedList ? (
        <AssignedProfilesList
          projectsWithProfiles={projectsWithProfiles}
          projects={projects}
          profiles={allProfiles}
          onViewProfile={(profileId, projectId) => {
            setSelectedProjectId(projectId);
            setSelectedTemplateId(profileId);
            setShowAssignedList(false);
          }}
        />
      ) : (
        <Form>
          <Form.Field>
            <Dropdown
              fluid
              selection
              search
              options={projectOptions}
              value={selectedProjectId}
              onChange={handleProjectChange}
              placeholder={t('common.selectProject')}
            />
          </Form.Field>

          {selectedProjectId && (
            <>
              <Form.Field>
                <Select
                  options={templateOptions}
                  value={selectedTemplateId}
                  onChange={handleTemplateChange}
                  placeholder={t('common.selectProfileTemplate')}
                  search
                  selectOnBlur={false}
                />
              </Form.Field>

              {selectedTemplate && (
                <>
                  <Segment>
                    <Header as="h4">{selectedTemplate.name}</Header>
                    <p>{selectedTemplate.description}</p>
                  </Segment>

                  {sections.map((section) => (
                    <SectionForm
                      key={section.id}
                      section={section}
                      fieldValues={fieldValues}
                      onFieldChange={handleFieldChange}
                      projectId={selectedProjectId}
                    />
                  ))}

                  {saveSuccess && (
                    <Message positive>
                      <Message.Header>{t('common.dataSaved')}</Message.Header>
                    </Message>
                  )}

                  <Button primary onClick={handleSave} loading={isSaving} disabled={isSaving}>
                    {t('action.save')}
                  </Button>
                </>
              )}
            </>
          )}
        </Form>
      )}
    </div>
  );
});

const AssignedProfilesList = React.memo(
  ({ projectsWithProfiles, projects, profiles, onViewProfile }) => {
    const [t] = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProfiles = projectsWithProfiles.filter((item) => {
      const project = projects.find((p) => p.id === item.projectId);
      const profile = profiles.find((p) => p.id === item.profileId);
      const projectName = project ? project.name : '';
      const profileName = profile ? profile.name : '';
      const searchLower = searchTerm.toLowerCase();
      return (
        profileName.toLowerCase().includes(searchLower) ||
        projectName.toLowerCase().includes(searchLower)
      );
    });

    return (
      <div>
        <Input
          icon="search"
          placeholder={t('common.searchProfiles')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: '1rem' }}
          fluid
        />

        {filteredProfiles.length === 0 ? (
          <Segment placeholder>
            <Header icon>
              <i className="file outline icon" />
              {searchTerm ? t('common.noResultsFound') : t('common.noAssignedProfiles')}
            </Header>
          </Segment>
        ) : (
          <Table celled striped>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{t('common.profileName')}</Table.HeaderCell>
                <Table.HeaderCell>{t('common.project')}</Table.HeaderCell>
                <Table.HeaderCell>{t('common.createdAt')}</Table.HeaderCell>
                <Table.HeaderCell>{t('action.actions')}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredProfiles.map((item) => {
                const project = projects.find((p) => p.id === item.projectId);
                const profile = profiles.find((p) => p.id === item.profileId);
                return (
                  <Table.Row key={`${item.projectId}-${item.profileId}`}>
                    <Table.Cell>{profile ? profile.name : 'N/A'}</Table.Cell>
                    <Table.Cell>{project ? project.name : 'N/A'}</Table.Cell>
                    <Table.Cell>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                    </Table.Cell>
                    <Table.Cell>
                      <Button
                        size="tiny"
                        onClick={() => onViewProfile(item.profileId, item.projectId)}
                      >
                        {t('action.view')}
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        )}
      </div>
    );
  },
);

AssignedProfilesList.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  projectsWithProfiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  projects: PropTypes.arrayOf(PropTypes.object).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  profiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  onViewProfile: PropTypes.func.isRequired,
};

const SectionForm = React.memo(({ section, fieldValues, onFieldChange, projectId }) => {
  const fields = useSelector((state) => selectFieldsBySectionId(state, section.id));

  return (
    <Segment>
      <Header as="h4">{section.name}</Header>
      {section.description && <p>{section.description}</p>}

      {fields.map((field) => (
        <FieldInput
          key={field.id}
          field={field}
          value={fieldValues[field.id] || ''}
          onChange={(value) => onFieldChange(field.id, value)}
          projectId={projectId}
        />
      ))}
    </Segment>
  );
});

SectionForm.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  section: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  fieldValues: PropTypes.object.isRequired,
  onFieldChange: PropTypes.func.isRequired,
  projectId: PropTypes.string,
};

SectionForm.defaultProps = {
  projectId: null,
};

const FieldInput = React.memo(({ field, value, onChange, projectId }) => {
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [localCalendarType, setLocalCalendarType] = useState('gregorian');
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState(null);

  // Parse file data from value (could be JSON object or base64 string)
  useEffect(() => {
    if (value) {
      // Check if value is a base64 string (legacy format)
      if (value.startsWith('data:')) {
        const mimeType = value.split(':')[1].split(';')[0];
        const type = mimeType.split('/')[0];
        setFileType(type);
        setFilePreview(value);
        setFileName(null);
      } else {
        // Try to parse as JSON (new format with server reference)
        try {
          const fileData = JSON.parse(value);
          if (fileData.uploadedFileId && fileData.filename) {
            const mimeType = fileData.mimeType || 'application/octet-stream';
            const type = mimeType.split('/')[0];
            setFileType(type);
            setFileName(fileData.filename);
            // Generate preview URL for image/video/audio
            if (type === 'image' || type === 'video' || type === 'audio') {
              setFilePreview(api.getProfileFileUrl(fileData.uploadedFileId, fileData.filename));
            }
          }
        } catch (e) {
          // Not JSON, might be plain filename (legacy)
          setFileType('document');
          setFilePreview(null);
          setFileName(value);
        }
      }
    } else {
      setFilePreview(null);
      setFileType(null);
      setFileName(null);
    }
  }, [value]);

  const handleChange = useCallback(
    (e, { value: newValue }) => {
      onChange(newValue);
    },
    [onChange],
  );

  const handleFileChange = useCallback(
    async (e) => {
      const file = e.target.files[0];
      if (!file || !projectId) return;

      setIsUploading(true);

      try {
        // Upload file to server
        const result = await api.uploadProfileFile(projectId, field.id, file);

        // Store file metadata as JSON
        const fileData = {
          uploadedFileId: result.uploadedFileId,
          filename: result.filename,
          mimeType: result.mimeType,
          size: result.size,
        };

        // Update preview
        const type = result.mimeType.split('/')[0];
        setFileType(type);
        if (type === 'image' || type === 'video' || type === 'audio') {
          setFilePreview(api.getProfileFileUrl(result.uploadedFileId, result.filename));
        }

        // Save the file reference
        onChange(JSON.stringify(fileData));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('File upload failed:', error);
        // eslint-disable-next-line no-alert
        alert('File upload failed. Please try again.');
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, projectId, field.id],
  );

  const handleDownload = useCallback(() => {
    if (!value) return;

    if (value.startsWith('data:')) {
      // Legacy base64 data - create download link
      const link = document.createElement('a');
      link.href = value;

      const mimeMatch = value.match(/data:([^;]+);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
      const extension = mimeType.split('/')[1] || 'file';
      const filename = `${field.label || 'file'}.${extension}`;

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Server file reference
      try {
        const fileData = JSON.parse(value);
        if (fileData.uploadedFileId && fileData.filename) {
          const url = api.getProfileFileUrl(fileData.uploadedFileId, fileData.filename);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileData.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to download file:', e);
      }
    }
  }, [value, field.label]);

  const handlePreview = useCallback(() => {
    if (!value) return;

    let previewUrl = null;

    if (value.startsWith('data:')) {
      // Legacy base64 data
      previewUrl = value;
    } else {
      // Server file reference
      try {
        const fileData = JSON.parse(value);
        if (fileData.uploadedFileId && fileData.filename) {
          previewUrl = api.getProfileFileUrl(fileData.uploadedFileId, fileData.filename);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to parse file data:', e);
        return;
      }
    }

    if (!previewUrl) return;

    // Determine content based on file type
    let content = '<p>Preview not available for this file type</p>';
    if (fileType === 'image') {
      content = `<img src="${previewUrl}" style="max-width: 100%; max-height: 100vh;" />`;
    } else if (fileType === 'video') {
      content = `<video src="${previewUrl}" controls style="max-width: 100%; max-height: 100vh;" />`;
    } else if (fileType === 'audio') {
      content = `<audio src="${previewUrl}" controls />`;
    }

    // Open in new window
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>File Preview</title></head>
          <body style="margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0;">
            ${content}
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  }, [value, fileType]);

  switch (field.fieldType) {
    case 'file':
    case 'FILE':
      return (
        <Form.Field>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label>
            {field.label}
            {field.metadata?.isRequired && ' *'}
          </label>
          <Input
            type="file"
            onChange={handleFileChange}
            required={field.metadata?.isRequired}
            disabled={isUploading}
          />
          {isUploading && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.9em', color: '#2185d0' }}>
              Uploading file...
            </div>
          )}
          {fileName && !isUploading && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.9em', color: '#666' }}>
              Current file: {fileName}
            </div>
          )}
          {(filePreview || (value && value.startsWith('data:'))) && (
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
              <Button size="tiny" onClick={handlePreview} icon="eye" content="Preview" />
              <Button size="tiny" onClick={handleDownload} icon="download" content="Download" />
            </div>
          )}
          {filePreview && (
            <div style={{ marginTop: '1rem' }}>
              {fileType === 'image' && (
                <img
                  src={filePreview}
                  alt="Preview"
                  style={{
                    maxWidth: '300px',
                    maxHeight: '300px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                  }}
                />
              )}
              {fileType === 'video' && (
                <video
                  src={filePreview}
                  controls
                  style={{
                    maxWidth: '400px',
                    maxHeight: '300px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                  }}
                >
                  <track kind="captions" />
                </video>
              )}
              {fileType === 'audio' && (
                <audio src={filePreview} controls style={{ width: '100%', maxWidth: '400px' }}>
                  <track kind="captions" />
                </audio>
              )}
            </div>
          )}
        </Form.Field>
      );

    case 'email':
    case 'EMAIL':
      return (
        <Form.Field>
          <Input
            label={field.label}
            value={value || ''}
            onChange={handleChange}
            required={field.metadata?.isRequired}
            type="email"
          />
        </Form.Field>
      );

    case 'date':
    case 'DATE': {
      const parseDateToObject = (dateStr) => {
        if (!dateStr) return null;
        return new Date(dateStr);
      };

      const dateToISOString = (date) => {
        if (!date) return '';
        return date.toISOString();
      };

      const isLocalJalali = localCalendarType === 'jalali';

      return (
        <Form.Field>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              {field.label}
              {field.metadata?.isRequired && ' *'}
            </span>
            <Button.Group size="mini" style={{ marginLeft: '10px' }}>
              <Button
                type="button"
                active={localCalendarType === 'gregorian'}
                onClick={() => setLocalCalendarType('gregorian')}
              >
                Gregorian
              </Button>
              <Button
                type="button"
                active={localCalendarType === 'jalali'}
                onClick={() => setLocalCalendarType('jalali')}
              >
                Jalali
              </Button>
            </Button.Group>
          </label>
          {isLocalJalali ? (
            <JalaliDatePicker
              value={
                value ? new DateObject(parseDateToObject(value)).convert(persian, persianEn) : null
              }
              onChange={(dateObj) => {
                const date = dateObj?.toDate?.();
                onChange(date ? dateToISOString(date) : '');
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
              selected={parseDateToObject(value)}
              onChange={(date) => onChange(date ? dateToISOString(date) : '')}
              dateFormat="yyyy-MM-dd"
              placeholderText="YYYY-MM-DD"
              className={styles.datePickerInput}
            />
          )}
        </Form.Field>
      );
    }

    case 'number':
    case 'NUMBER':
      return (
        <Form.Field>
          <Input
            label={field.label}
            value={value || ''}
            onChange={handleChange}
            required={field.metadata?.isRequired}
            type="number"
          />
        </Form.Field>
      );

    case 'text':
    case 'TEXT':
    default:
      return (
        <Form.Field>
          <Input
            label={field.label}
            value={value || ''}
            onChange={handleChange}
            required={field.metadata?.isRequired}
            type="text"
          />
        </Form.Field>
      );
  }
});

FieldInput.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  field: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  projectId: PropTypes.string,
};

FieldInput.defaultProps = {
  value: '',
  projectId: null,
};

export default FilledProjectProfilesPane;
