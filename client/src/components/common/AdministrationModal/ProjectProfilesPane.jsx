/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Header, Table, Modal, Form, Input, TextArea, Confirm } from 'semantic-ui-react';

import entryActions from '../../../entry-actions';
import {
  selectAllProjectProfiles,
  selectSectionsByProfileId,
} from '../../../selectors/projectProfiles';
import { selectAllProjects } from '../../../selectors/projects';
import ProjectProfileDetailsModal from './ProjectProfileDetailsModal';

import styles from './ProjectProfilesPane.module.scss';

const ProjectProfilesPane = React.memo(() => {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const projectProfiles = useSelector(selectAllProjectProfiles);
  const allProjects = useSelector(selectAllProjects);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const selectedProfileSections = useSelector((state) =>
    selectSectionsByProfileId(state, selectedProfile?.id),
  );

  // Filter profiles based on search query
  const filteredProfiles = projectProfiles.filter((profile) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = profile.name.toLowerCase().includes(query);
    const descriptionMatch = profile.description?.toLowerCase().includes(query);
    const project = allProjects.find((p) => p.id === profile.projectId);
    const projectMatch = project?.name.toLowerCase().includes(query);

    return nameMatch || descriptionMatch || projectMatch;
  });

  const handleSearchChange = useCallback((e, { value }) => {
    setSearchQuery(value);
  }, []);

  const handleOpenModal = useCallback((profile = null) => {
    if (profile) {
      setEditingProfile(profile);
      setFormData({
        name: profile.name,
        description: profile.description || '',
      });
    } else {
      setEditingProfile(null);
      setFormData({
        name: '',
        description: '',
      });
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingProfile(null);
    setFormData({
      name: '',
      description: '',
    });
  }, []);

  const handleInputChange = useCallback((e, { name, value }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!formData.name.trim()) {
      return;
    }

    // Always set isTemplate to true for profile templates
    const dataToSubmit = {
      ...formData,
      isTemplate: true,
      projectId: null,
    };

    if (editingProfile) {
      dispatch(entryActions.updateProjectProfile(editingProfile.id, dataToSubmit));
    } else {
      dispatch(entryActions.createProjectProfile(dataToSubmit));
    }

    handleCloseModal();
  }, [dispatch, editingProfile, formData, handleCloseModal]);

  const handleDelete = useCallback((profileId) => {
    setProfileToDelete(profileId);
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (profileToDelete) {
      dispatch(entryActions.deleteProjectProfile(profileToDelete));
    }
    setShowDeleteConfirm(false);
    setProfileToDelete(null);
  }, [dispatch, profileToDelete]);

  const handleOpenDetailsModal = useCallback((profile) => {
    setSelectedProfile(profile);
    setIsDetailsModalOpen(true);
  }, []);

  const handleCloseDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false);
    setSelectedProfile(null);
  }, []);

  return (
    <div className={styles.wrapper}>
      <Header as="h2" className={styles.header}>
        {t('common.projectProfiles_title')}
      </Header>

      {/* <Message info>
        <Message.Header>{t('common.projectProfile')}</Message.Header>
        <p>{t('common.projectProfiles_description')}</p>
      </Message> */}

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
        <Input
          icon="search"
          iconPosition="left"
          placeholder={t('common.searchProfiles')}
          value={searchQuery}
          onChange={handleSearchChange}
          style={{ flex: 1 }}
        />
        <Button primary onClick={() => handleOpenModal()}>
          {t('common.addProjectProfile_title')}
        </Button>
      </div>

      {filteredProfiles.length > 0 ? (
        <Table celled striped className={styles.table}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>{t('common.name')}</Table.HeaderCell>
              <Table.HeaderCell>{t('common.description')}</Table.HeaderCell>
              {/* <Table.HeaderCell>{t('common.projectProfiles_project_title')}</Table.HeaderCell> */}
              {/* <Table.HeaderCell>{t('common.isTemplate')}</Table.HeaderCell> */}
              <Table.HeaderCell>{t('common.actions')}</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredProfiles.map((profile) => {
              return (
                <Table.Row key={profile.id}>
                  <Table.Cell>{profile.name}</Table.Cell>
                  <Table.Cell>{profile.description || '-'}</Table.Cell>
                  {/* <Table.Cell>{project ? project.name : '-'}</Table.Cell> */}
                  {/* <Table.Cell>{profile.isTemplate ? t('common.yes') : t('common.no')}</Table.Cell> */}
                  <Table.Cell>
                    <Button size="small" primary onClick={() => handleOpenDetailsModal(profile)}>
                      {t('common.manageSectionsAndFields')}
                    </Button>
                    <Button size="small" onClick={() => handleOpenModal(profile)}>
                      {t('action.edit')}
                    </Button>
                    <Button size="small" negative onClick={() => handleDelete(profile.id)}>
                      {t('action.delete')}
                    </Button>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
          {searchQuery ? t('common.noResultsFound') : t('common.noProjectProfilesYet')}
        </div>
      )}

      <Modal open={isModalOpen} onClose={handleCloseModal} size="small">
        <Modal.Header>
          {editingProfile
            ? t('common.editProjectProfile_title')
            : t('common.addProjectProfile_title')}
        </Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field required>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('common.enterProjectProfileName')}
                label={t('common.name')}
              />
            </Form.Field>
            <Form.Field>
              <label htmlFor="description">{t('common.description')}</label>
              <TextArea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t('common.enterProjectProfileDescription')}
                rows={3}
              />
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={handleCloseModal}>{t('action.cancel')}</Button>
          <Button primary onClick={handleSubmit} disabled={!formData.name.trim()}>
            {editingProfile ? t('action.save') : t('action.create')}
          </Button>
        </Modal.Actions>
      </Modal>

      <ProjectProfileDetailsModal
        profile={selectedProfile}
        sections={selectedProfileSections}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
      />

      <Confirm
        open={showDeleteConfirm}
        header={t('common.confirmDelete', { defaultValue: 'Confirm Delete' })}
        content={t('common.areYouSureYouWantToDeleteThisProjectProfile')}
        confirmButton={t('action.delete', { defaultValue: 'Delete' })}
        cancelButton={t('common.cancel', { defaultValue: 'Cancel' })}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
});

ProjectProfilesPane.propTypes = {};

export default ProjectProfilesPane;
