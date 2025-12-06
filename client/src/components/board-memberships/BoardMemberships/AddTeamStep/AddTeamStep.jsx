/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Icon } from 'semantic-ui-react';
import { Input, Popup } from '../../../../lib/custom-ui';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { useField, useNestedRef, useSteps } from '../../../../hooks';
import SelectPermissionsStep from '../SelectPermissionsStep';

import styles from './AddTeamStep.module.scss';

const StepTypes = {
  SELECT_PERMISSIONS: 'SELECT_PERMISSIONS',
};

const AddTeamStep = React.memo(({ onClose }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();
  const [search, handleSearchChange] = useField('');
  const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);

  const boardId = useSelector((state) => selectors.selectPath(state).boardId);
  const teams = useSelector(selectors.selectAllTeams);
  const boardTeams = useSelector((state) => selectors.selectBoardTeamsByBoardId(state, boardId));
  const currentTeamIds = useMemo(() => boardTeams.map((bt) => bt.teamId), [boardTeams]);

  const filteredTeams = useMemo(
    () => teams.filter((team) => team.name.toLowerCase().includes(cleanSearch)),
    [teams, cleanSearch],
  );

  const [searchFieldRef, handleSearchFieldRef] = useNestedRef('inputRef');

  useEffect(() => {
    dispatch(entryActions.fetchTeams());
    if (boardId) {
      dispatch(entryActions.fetchBoardTeams(boardId));
    }
  }, [dispatch, boardId]);

  const handleRoleSelect = useCallback(
    (data) => {
      dispatch(
        entryActions.createBoardTeam(boardId, {
          ...data,
          teamId: step.params.teamId,
        }),
      );

      onClose();
    },
    [onClose, dispatch, boardId, step],
  );

  const handleTeamSelect = useCallback(
    (teamId) => {
      openStep(StepTypes.SELECT_PERMISSIONS, {
        teamId,
      });
    },
    [openStep],
  );

  useEffect(() => {
    searchFieldRef.current.focus({
      preventScroll: true,
    });
  }, [searchFieldRef]);

  if (step && step.type === StepTypes.SELECT_PERMISSIONS) {
    const currentTeam = teams.find((team) => team.id === step.params.teamId);

    if (currentTeam) {
      return (
        <SelectPermissionsStep
          buttonContent="action.addTeam"
          onSelect={handleRoleSelect}
          onBack={handleBack}
          onClose={onClose}
        />
      );
    }

    openStep(null);
  }

  return (
    <>
      <Popup.Header>
        {t('common.addTeam', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Input
          fluid
          ref={handleSearchFieldRef}
          value={search}
          placeholder={t('common.searchTeams')}
          maxLength={128}
          icon="search"
          onChange={handleSearchChange}
        />
        {filteredTeams.length > 0 ? (
          <div className={styles.teams}>
            {filteredTeams.map((team) => {
              const isActive = currentTeamIds.includes(team.id);
              return (
                <button
                  key={team.id}
                  type="button"
                  disabled={isActive}
                  className={styles.team}
                  onClick={() => handleTeamSelect(team.id)}
                >
                  <Icon name="users" className={styles.teamIcon} />
                  <span className={styles.teamName}>{team.name}</span>
                  <span className={styles.teamMembers}>
                    {t('common.nMembers', { count: team.memberships?.length || 0 })}
                  </span>
                  {isActive && <Icon name="check" className={styles.checkIcon} />}
                </button>
              );
            })}
          </div>
        ) : (
          <div className={styles.noTeams}>{t('common.noTeamsAvailable')}</div>
        )}
      </Popup.Content>
    </>
  );
});

AddTeamStep.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default AddTeamStep;
