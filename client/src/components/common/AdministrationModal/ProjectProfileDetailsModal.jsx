/* eslint-disable react/forbid-prop-types */
/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Header,
  Modal,
  Form,
  Input,
  Select,
  Segment,
  Icon,
  List,
  Confirm,
} from 'semantic-ui-react';

import entryActions from '../../../entry-actions';
import { selectFieldsBySectionId } from '../../../selectors/projectProfiles';
import PROJECT_PROFILE_SECTION_TYPES from '../../../constants/ProjectProfileSectionTypes';
import PROJECT_PROFILE_FIELD_TYPES from '../../../constants/ProjectProfileFieldTypes';

function SectionItem({
  section,
  onAddField,
  onEditSection,
  onDeleteSection,
  onEditField,
  onDeleteField,
  t,
}) {
  const fields = useSelector((state) => selectFieldsBySectionId(state, section.id));

  return (
    <Segment>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Header as="h4">
          {section.name}
          <Header.Subheader>
            {t(`common.sectionType_${section.type.toLowerCase()}`)}
          </Header.Subheader>
        </Header>
        <div>
          <Button size="tiny" onClick={() => onAddField(section.id)}>
            <Icon name="plus" /> {t('common.addField')}
          </Button>
          <Button size="tiny" onClick={() => onEditSection(section)}>
            <Icon name="edit" />
          </Button>
          <Button size="tiny" negative onClick={() => onDeleteSection(section.id)}>
            <Icon name="trash" />
          </Button>
        </div>
      </div>

      {fields.length > 0 ? (
        <List divided relaxed>
          {fields.map((field) => (
            <List.Item key={field.id}>
              <List.Content floated="right">
                <Button size="mini" onClick={() => onEditField(field, section.id)}>
                  <Icon name="edit" />
                </Button>
                <Button size="mini" negative onClick={() => onDeleteField(field.id)}>
                  <Icon name="trash" />
                </Button>
              </List.Content>
              <List.Icon name="tag" />
              <List.Content>
                <List.Header>
                  {field.label} {field.isRequired && <span style={{ color: 'red' }}>*</span>}
                </List.Header>
                <List.Description>
                  {field.type ? t(`common.fieldType_${field.type.toLowerCase()}`) : '-'}
                </List.Description>
              </List.Content>
            </List.Item>
          ))}
        </List>
      ) : (
        <p style={{ marginTop: '10px', color: '#999' }}>{t('common.noFieldsYet')}</p>
      )}
    </Segment>
  );
}

SectionItem.propTypes = {
  section: PropTypes.object.isRequired,
  onAddField: PropTypes.func.isRequired,
  onEditSection: PropTypes.func.isRequired,
  onDeleteSection: PropTypes.func.isRequired,
  onEditField: PropTypes.func.isRequired,
  onDeleteField: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

const ProjectProfileDetailsModal = React.memo(({ profile, isOpen, onClose, sections }) => {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const [isAddingSectionModalOpen, setIsAddingSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [sectionFormData, setSectionFormData] = useState({
    name: '',
    type: PROJECT_PROFILE_SECTION_TYPES.CUSTOM,
  });

  const [isAddingFieldModalOpen, setIsAddingFieldModalOpen] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [fieldFormData, setFieldFormData] = useState({
    label: '',
    type: PROJECT_PROFILE_FIELD_TYPES.TEXT,
    isRequired: false,
    options: '',
  });

  // Confirmation states
  const [showDeleteSectionConfirm, setShowDeleteSectionConfirm] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [showDeleteFieldConfirm, setShowDeleteFieldConfirm] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState(null);

  // Get fields for the current section
  const currentSectionFields = useSelector((state) =>
    currentSectionId ? selectFieldsBySectionId(state, currentSectionId) : [],
  );

  const fieldTypeOptions = [
    { key: 'text', value: PROJECT_PROFILE_FIELD_TYPES.TEXT, text: t('common.fieldType_text') },
    { key: 'email', value: PROJECT_PROFILE_FIELD_TYPES.EMAIL, text: t('common.fieldType_email') },
    { key: 'date', value: PROJECT_PROFILE_FIELD_TYPES.DATE, text: t('common.fieldType_date') },
    { key: 'file', value: PROJECT_PROFILE_FIELD_TYPES.FILE, text: t('common.fieldType_file') },
    {
      key: 'number',
      value: PROJECT_PROFILE_FIELD_TYPES.NUMBER,
      text: t('common.fieldType_number'),
    },
    {
      key: 'people',
      value: PROJECT_PROFILE_FIELD_TYPES.PEOPLE,
      text: t('common.fieldType_people'),
    },
    {
      key: 'link',
      value: PROJECT_PROFILE_FIELD_TYPES.LINK,
      text: t('common.fieldType_link'),
    },
  ];

  // Section handlers
  const handleOpenAddSectionModal = useCallback(() => {
    setEditingSection(null);
    setSectionFormData({
      name: '',
      type: PROJECT_PROFILE_SECTION_TYPES.CUSTOM,
    });
    setIsAddingSectionModalOpen(true);
  }, []);

  const handleOpenEditSectionModal = useCallback((section) => {
    setEditingSection(section);
    setSectionFormData({
      name: section.name,
      type: section.type,
    });
    setIsAddingSectionModalOpen(true);
  }, []);

  const handleCloseSectionModal = useCallback(() => {
    setIsAddingSectionModalOpen(false);
    setEditingSection(null);
    setSectionFormData({
      name: '',
      type: PROJECT_PROFILE_SECTION_TYPES.CUSTOM,
    });
  }, []);

  const handleSectionInputChange = useCallback((e, { name, value }) => {
    setSectionFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSectionSubmit = useCallback(() => {
    if (!sectionFormData.name.trim()) {
      return;
    }

    if (editingSection) {
      dispatch(entryActions.updateProjectProfileSection(editingSection.id, sectionFormData));
    } else {
      // Calculate position for new section (add to end)
      const position = sections ? sections.length : 0;
      const dataToSend = {
        ...sectionFormData,
        position,
      };
      dispatch(entryActions.createProjectProfileSection(profile.id, dataToSend));
    }

    handleCloseSectionModal();
  }, [dispatch, editingSection, profile, sectionFormData, sections, handleCloseSectionModal]);

  const handleDeleteSection = useCallback((sectionId) => {
    setSectionToDelete(sectionId);
    setShowDeleteSectionConfirm(true);
  }, []);

  const handleConfirmDeleteSection = useCallback(() => {
    if (sectionToDelete) {
      dispatch(entryActions.deleteProjectProfileSection(sectionToDelete));
    }
    setShowDeleteSectionConfirm(false);
    setSectionToDelete(null);
  }, [dispatch, sectionToDelete]);

  // Field handlers
  const handleOpenAddFieldModal = useCallback((sectionId) => {
    setCurrentSectionId(sectionId);
    setEditingField(null);
    setFieldFormData({
      label: '',
      type: PROJECT_PROFILE_FIELD_TYPES.TEXT,
      isRequired: false,
      options: '',
    });
    setIsAddingFieldModalOpen(true);
  }, []);

  const handleOpenEditFieldModal = useCallback((field, sectionId) => {
    setCurrentSectionId(sectionId);
    setEditingField(field);
    setFieldFormData({
      label: field.label,
      type: field.type,
      isRequired: field.isRequired || false,
      options: field.options || '',
    });
    setIsAddingFieldModalOpen(true);
  }, []);

  const handleCloseFieldModal = useCallback(() => {
    setIsAddingFieldModalOpen(false);
    setCurrentSectionId(null);
    setEditingField(null);
    setFieldFormData({
      label: '',
      type: PROJECT_PROFILE_FIELD_TYPES.TEXT,
      isRequired: false,
      options: '',
    });
  }, []);

  const handleFieldInputChange = useCallback((e, { name, value, checked, type }) => {
    setFieldFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleFieldSubmit = useCallback(() => {
    if (!fieldFormData.label.trim()) {
      return;
    }

    if (editingField) {
      dispatch(entryActions.updateProjectProfileField(editingField.id, fieldFormData));
    } else {
      // Calculate position based on current section's fields
      const position = currentSectionFields?.length || 0;

      // Map frontend field names to backend expected names
      const dataToSend = {
        fieldType: fieldFormData.type,
        label: fieldFormData.label,
        value: '',
        metadata: {
          isRequired: fieldFormData.isRequired,
          options: fieldFormData.options,
        },
        position,
      };

      dispatch(entryActions.createProjectProfileField(currentSectionId, dataToSend));
    }

    handleCloseFieldModal();
  }, [
    dispatch,
    editingField,
    currentSectionId,
    fieldFormData,
    currentSectionFields,
    handleCloseFieldModal,
  ]);

  const handleDeleteField = useCallback((fieldId) => {
    setFieldToDelete(fieldId);
    setShowDeleteFieldConfirm(true);
  }, []);

  const handleConfirmDeleteField = useCallback(() => {
    if (fieldToDelete) {
      dispatch(entryActions.deleteProjectProfileField(fieldToDelete));
    }
    setShowDeleteFieldConfirm(false);
    setFieldToDelete(null);
  }, [dispatch, fieldToDelete]);

  if (!profile) return null;

  return (
    <>
      <Modal open={isOpen} onClose={onClose} size="large">
        <Modal.Header>{profile.name}</Modal.Header>
        <Modal.Content scrolling>
          {profile.description && (
            <p style={{ fontSize: '1rem', color: '#666', marginBottom: '1.5rem' }}>
              {profile.description}
            </p>
          )}
          <div style={{ marginBottom: '1rem' }}>
            <Button primary onClick={handleOpenAddSectionModal}>
              <Icon name="plus" /> {t('common.addSection')}
            </Button>
          </div>

          {sections && sections.length > 0 ? (
            sections.map((section) => (
              <SectionItem
                key={section.id}
                section={section}
                onAddField={handleOpenAddFieldModal}
                onEditSection={handleOpenEditSectionModal}
                onDeleteSection={handleDeleteSection}
                onEditField={handleOpenEditFieldModal}
                onDeleteField={handleDeleteField}
                t={t}
              />
            ))
          ) : (
            <Segment placeholder textAlign="center">
              <Header icon>
                <Icon name="folder outline" size="huge" />
                <div style={{ marginTop: '1rem', fontSize: '1.2rem', fontWeight: 'normal' }}>
                  {t('common.noSectionsYet')}
                </div>
              </Header>
              <Button primary onClick={handleOpenAddSectionModal}>
                {t('common.addSection')}
              </Button>
            </Segment>
          )}
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={onClose}>{t('action.close')}</Button>
        </Modal.Actions>
      </Modal>

      {/* Add/Edit Section Modal */}
      <Modal open={isAddingSectionModalOpen} onClose={handleCloseSectionModal} size="small">
        <Modal.Header>
          {editingSection ? t('common.editSection_title') : t('common.addSection_title')}
        </Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field required>
              <label htmlFor="sectionName">{t('common.sectionName')}</label>
              <Input
                id="sectionName"
                name="name"
                value={sectionFormData.name}
                onChange={handleSectionInputChange}
                placeholder={t('common.enterSectionName')}
              />
            </Form.Field>
            <Form.Field>
              <label htmlFor="sectionDescription">{t('common.description')}</label>
              <Input
                id="sectionDescription"
                name="description"
                value={sectionFormData.description}
                onChange={handleSectionInputChange}
                placeholder={t('common.enterSectionDescription')}
              />
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={handleCloseSectionModal}>{t('action.cancel')}</Button>
          <Button primary onClick={handleSectionSubmit} disabled={!sectionFormData.name.trim()}>
            {editingSection ? t('action.save') : t('action.create')}
          </Button>
        </Modal.Actions>
      </Modal>

      {/* Add/Edit Field Modal */}
      <Modal open={isAddingFieldModalOpen} onClose={handleCloseFieldModal} size="small">
        <Modal.Header>
          {editingField ? t('common.editField_title') : t('common.addField_title')}
        </Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field required>
              <label htmlFor="fieldLabel">{t('common.fieldLabel')}</label>
              <Input
                id="fieldLabel"
                name="label"
                value={fieldFormData.label}
                onChange={handleFieldInputChange}
                placeholder={t('common.enterFieldLabel')}
              />
            </Form.Field>
            <Form.Field required>
              <label htmlFor="fieldType">{t('common.fieldType')}</label>
              <Select
                id="fieldType"
                name="type"
                value={fieldFormData.type}
                onChange={handleFieldInputChange}
                options={fieldTypeOptions}
                placeholder={t('common.selectFieldType')}
              />
            </Form.Field>
            {fieldFormData.type === PROJECT_PROFILE_FIELD_TYPES.SELECT && (
              <Form.Field>
                <label htmlFor="fieldOptions">{t('common.fieldOptions')}</label>
                <Input
                  id="fieldOptions"
                  name="options"
                  value={fieldFormData.options}
                  onChange={handleFieldInputChange}
                  placeholder={t('common.enterFieldOptions')}
                />
                <small>{t('common.fieldOptionsHelp')}</small>
              </Form.Field>
            )}
            <Form.Field>
              <Form.Checkbox
                name="isRequired"
                label={t('common.required')}
                checked={fieldFormData.isRequired}
                onChange={handleFieldInputChange}
              />
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={handleCloseFieldModal}>{t('action.cancel')}</Button>
          <Button primary onClick={handleFieldSubmit} disabled={!fieldFormData.label.trim()}>
            {editingField ? t('action.save') : t('action.create')}
          </Button>
        </Modal.Actions>
      </Modal>

      <Confirm
        open={showDeleteSectionConfirm}
        header={t('common.confirmDelete', { defaultValue: 'Confirm Delete' })}
        content={t('common.areYouSureYouWantToDeleteThisSection')}
        confirmButton={t('action.delete', { defaultValue: 'Delete' })}
        cancelButton={t('common.cancel', { defaultValue: 'Cancel' })}
        onConfirm={handleConfirmDeleteSection}
        onCancel={() => setShowDeleteSectionConfirm(false)}
      />

      <Confirm
        open={showDeleteFieldConfirm}
        header={t('common.confirmDelete', { defaultValue: 'Confirm Delete' })}
        content={t('common.areYouSureYouWantToDeleteThisField')}
        confirmButton={t('action.delete', { defaultValue: 'Delete' })}
        cancelButton={t('common.cancel', { defaultValue: 'Cancel' })}
        onConfirm={handleConfirmDeleteField}
        onCancel={() => setShowDeleteFieldConfirm(false)}
      />
    </>
  );
});

ProjectProfileDetailsModal.propTypes = {
  profile: PropTypes.object,
  sections: PropTypes.array,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

ProjectProfileDetailsModal.defaultProps = {
  profile: null,
  sections: [],
};

export default ProjectProfileDetailsModal;
