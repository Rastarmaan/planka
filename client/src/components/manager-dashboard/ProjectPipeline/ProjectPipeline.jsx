/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import entryActions from '../../../entry-actions';
import selectors from '../../../selectors';

import PipelineSection from '../PipelineSection';

import styles from './ProjectPipeline.module.scss';

const EMPTY_STATE_FALLBACK = 'گزارشی ثبت نشده است';

const ProjectPipeline = React.memo(({ selectedProjectId }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const reports = useSelector(selectors.selectAllReports);
  const reportPhases = useSelector(selectors.selectAllReportPhases);
  const phaseMemberships = useSelector(selectors.selectAllReportPhaseMemberships);
  const users = useSelector(selectors.selectAllActiveUsers);

  const hasRequestedRef = useRef(false);

  useEffect(() => {
    if (!hasRequestedRef.current) {
      dispatch(entryActions.fetchReports());
      hasRequestedRef.current = true;
    }
  }, [dispatch]);

  const usersById = useMemo(() => {
    const map = new Map();
    (users || []).forEach((user) => {
      if (user && user.id) {
        map.set(user.id, user);
      }
    });
    return map;
  }, [users]);

  const membershipsByPhaseId = useMemo(() => {
    const map = new Map();

    (phaseMemberships || []).forEach((membership) => {
      if (!membership || !membership.phaseId) {
        return;
      }

      const membershipWithUser = {
        ...membership,
        user: membership.userId ? usersById.get(membership.userId) || null : null,
      };

      if (!map.has(membership.phaseId)) {
        map.set(membership.phaseId, []);
      }

      map.get(membership.phaseId).push(membershipWithUser);
    });

    return map;
  }, [phaseMemberships, usersById]);

  const phasesByReportId = useMemo(() => {
    const map = new Map();

    (reportPhases || []).forEach((phaseItem) => {
      if (!phaseItem) {
        return;
      }

      const phase = phaseItem.ref ? { ...phaseItem.ref } : { ...phaseItem };

      if (selectedProjectId && phase.projectId && phase.projectId !== selectedProjectId) {
        return;
      }

      const enrichedPhase = {
        ...phase,
        memberships: membershipsByPhaseId.get(phase.id) || [],
      };

      if (!map.has(phase.reportId)) {
        map.set(phase.reportId, []);
      }

      map.get(phase.reportId).push(enrichedPhase);
    });

    map.forEach((phaseList) => {
      phaseList.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    });

    return map;
  }, [reportPhases, membershipsByPhaseId, selectedProjectId]);

  const sections = useMemo(() => {
    return (reports || [])
      .map((reportItem) => {
        if (!reportItem) {
          return null;
        }

        const report = reportItem.ref ? { ...reportItem.ref } : { ...reportItem };
        const phases = phasesByReportId.get(report.id) || [];

        if (selectedProjectId && phases.length === 0) {
          return null;
        }

        return {
          report,
          phases,
        };
      })
      .filter(Boolean);
  }, [reports, phasesByReportId, selectedProjectId]);

  return (
    <div className={styles.wrapper}>
      {sections.map(({ report, phases }) => (
        <PipelineSection key={report.id} report={report} phases={phases} />
      ))}
      {sections.length === 0 && (
        <div className={styles.empty}>
          {t('common.noProjects', { defaultValue: EMPTY_STATE_FALLBACK })}
        </div>
      )}
    </div>
  );
});

ProjectPipeline.propTypes = {
  selectedProjectId: PropTypes.string,
};

ProjectPipeline.defaultProps = {
  selectedProjectId: null,
};

export default ProjectPipeline;
