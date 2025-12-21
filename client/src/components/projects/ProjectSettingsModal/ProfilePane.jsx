/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Form,
  Header,
  Select,
  Segment,
  Input,
  TextArea,
  Checkbox,
  Message,
} from 'semantic-ui-react';

import selectors from '../../../selectors';
import {
  selectAllProjectProfiles,
  selectSectionsByProfileId,
  selectFieldsBySectionId,
  selectProjectProfileDataByProjectId,
} from '../../../selectors/projectProfiles';
import entryActions from '../../../entry-actions';
import PeopleField from './PeopleField';

const ProfilePane = React.memo(() => {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const currentProject = useSelector(selectors.selectCurrentProject);
  const allProfiles = useSelector(selectAllProjectProfiles);
  const templates = allProfiles.filter((profile) => profile.isTemplate);

  const [selectedTemplateId, setSelectedTemplateId] = useState(
    currentProject.profileId || (templates.length > 0 ? templates[0].id : null),
  );

  const selectedTemplate = allProfiles.find((p) => p.id === selectedTemplateId);
  const sections = useSelector((state) =>
    selectedTemplateId ? selectSectionsByProfileId(state, selectedTemplateId) : [],
  );

  const [fieldValues, setFieldValues] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const profileData = useSelector((state) =>
    selectProjectProfileDataByProjectId(state, currentProject.id),
  );

  // Load existing data from Redux store
  useEffect(() => {
    if (currentProject.id) {
      dispatch(entryActions.loadProjectProfileData(currentProject.id));
    }
  }, [currentProject.id, dispatch]);

  // Update fieldValues when profileData changes
  useEffect(() => {
    if (profileData && profileData.length > 0) {
      const loadedValues = {};
      profileData.forEach((item) => {
        loadedValues[item.fieldId] = item.value;
      });
      setFieldValues(loadedValues);
    }
  }, [profileData]);

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
    setIsSaving(true);
    setSaveSuccess(false);

    dispatch(
      entryActions.saveProjectProfileData(currentProject.id, selectedTemplateId, fieldValues),
    );

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsSaving(false);
    }, 3000);
  }, [dispatch, currentProject.id, selectedTemplateId, fieldValues]);

  const templateOptions = templates.map((profile) => ({
    key: profile.id,
    value: profile.id,
    text: profile.name,
  }));

  if (templates.length === 0) {
    return (
      <Segment>
        <Header as="h3">{t('common.projectProfile')}</Header>
        <p>{t('common.noProfileTemplatesAvailable')}</p>
      </Segment>
    );
  }

  return (
    <div>
      <Header as="h3">{t('common.projectProfile')}</Header>

      <Form>
        <Form.Field>
          <Select
            label={t('common.selectProfileTemplate')}
            options={templateOptions}
            value={selectedTemplateId}
            onChange={handleTemplateChange}
            placeholder={t('common.selectProfileTemplate')}
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
                projectId={currentProject.id}
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
      </Form>
    </div>
  );
});

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
  projectId: PropTypes.string.isRequired,
};

const FieldInput = React.memo(({ field, value, onChange, projectId }) => {
  const fieldType = (field.fieldType || field.type || 'text').toUpperCase();

  const handleChange = useCallback(
    (e, { value: newValue, checked }) => {
      if (fieldType === 'CHECKBOX') {
        onChange(checked);
      } else {
        onChange(newValue);
      }
    },
    [fieldType, onChange],
  );

  switch (fieldType) {
    case 'TEXTAREA':
      return (
        <Form.Field>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label>
            {field.label}
            {field.metadata?.isRequired && ' *'}
          </label>
          <TextArea
            value={value}
            onChange={handleChange}
            required={field.metadata?.isRequired}
            rows={3}
          />
        </Form.Field>
      );

    case 'EMAIL':
      return (
        <Form.Field>
          <Input
            label={field.label}
            value={value}
            onChange={handleChange}
            required={field.metadata?.isRequired}
            type="email"
          />
        </Form.Field>
      );

    case 'URL':
    case 'LINK':
      return (
        <Form.Field>
          <Input
            label={field.label}
            value={value}
            onChange={handleChange}
            required={field.metadata?.isRequired}
            type="url"
          />
        </Form.Field>
      );

    case 'DATE':
      return (
        <Form.Field>
          <Input
            label={field.label}
            value={value}
            onChange={handleChange}
            required={field.metadata?.isRequired}
            type="date"
          />
        </Form.Field>
      );

    case 'SELECT': {
      const options = field.metadata?.options
        ? field.metadata.options.split(',').map((opt) => ({
            key: opt.trim(),
            value: opt.trim(),
            text: opt.trim(),
          }))
        : [];
      return (
        <Form.Field>
          <Select
            label={field.label}
            value={value}
            onChange={handleChange}
            required={field.metadata?.isRequired}
            options={options}
          />
        </Form.Field>
      );
    }

    case 'CHECKBOX':
      return (
        <Form.Field>
          <Checkbox
            onChange={handleChange}
            required={field.metadata?.isRequired}
            checked={!!value}
            label={field.label}
          />
        </Form.Field>
      );

    case 'PEOPLE':
      return <PeopleField field={field} projectId={projectId} />;

    case 'TEXT':
    default:
      return (
        <Form.Field>
          <Input
            label={field.label}
            value={value}
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
  projectId: PropTypes.string.isRequired,
};

FieldInput.defaultProps = {
  value: '',
};

export default ProfilePane;
