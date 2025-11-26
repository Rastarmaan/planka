/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import classNames from 'classnames';
import debounce from 'lodash/debounce';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { Input } from '../../../lib/custom-ui';
import { useDidUpdate } from '../../../lib/hooks';
import { usePopup } from '../../../lib/popup';

import entryActions from '../../../entry-actions';
import { useNestedRef } from '../../../hooks';
import selectors from '../../../selectors';
import { UserRoles } from '../../../constants/Enums';
import BoardMembershipsStep from '../../board-memberships/BoardMembershipsStep';
import BoardReleasesFilterStep from '../../board-releases/BoardReleasesFilterStep';
import LabelChip from '../../labels/LabelChip';
import LabelsStep from '../../labels/LabelsStep';
import UserAvatar from '../../users/UserAvatar';
import StoryPointsSummaryStep from './StoryPointsSummaryStep';

import styles from './Filters.module.scss';

const Filters = React.memo(() => {
  const board = useSelector(selectors.selectCurrentBoard);
  const userIds = useSelector(selectors.selectFilterUserIdsForCurrentBoard);
  const labelIds = useSelector(selectors.selectFilterLabelIdsForCurrentBoard);
  const releaseIds = useSelector(selectors.selectFilterReleaseIdsForCurrentBoard);
  const currentUserId = useSelector(selectors.selectCurrentUserId);

  const dispatch = useDispatch();

  const withCurrentUserSelector = useSelector((state) => {
    const currentUser = selectors.selectCurrentUser(state);
    const currentProject = selectors.selectCurrentProject(state);
    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);

    const isAdmin = currentUser?.role === UserRoles.ADMIN;
    const isProjectManager =
      currentProject && currentUser && selectors.selectIsCurrentUserManagerForCurrentProject(state);

    return isAdmin || isProjectManager || !!boardMembership;
  });

  const [t] = useTranslation();
  const [search, setSearch] = useState(board.search);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const debouncedSearch = useMemo(
    () =>
      debounce((nextSearch) => {
        dispatch(entryActions.searchInCurrentBoard(nextSearch));
      }, 400),
    [dispatch],
  );

  const [searchFieldRef, handleSearchFieldRef] = useNestedRef('inputRef');

  const cancelSearch = useCallback(() => {
    debouncedSearch.cancel();
    setSearch('');
    dispatch(entryActions.searchInCurrentBoard(''));
    searchFieldRef.current.blur();
  }, [dispatch, debouncedSearch, searchFieldRef]);

  const handleUserSelect = useCallback(
    (userId) => {
      dispatch(entryActions.addUserToFilterInCurrentBoard(userId));
    },
    [dispatch],
  );

  const handleCurrentUserSelect = useCallback(() => {
    dispatch(entryActions.addUserToFilterInCurrentBoard(currentUserId));
  }, [currentUserId, dispatch]);

  const handleUserDeselect = useCallback(
    (userId) => {
      dispatch(entryActions.removeUserFromFilterInCurrentBoard(userId));
    },
    [dispatch],
  );

  const handleUserClick = useCallback(
    ({
      currentTarget: {
        dataset: { id: userId },
      },
    }) => {
      dispatch(entryActions.removeUserFromFilterInCurrentBoard(userId));
    },
    [dispatch],
  );

  const handleLabelSelect = useCallback(
    (labelId) => {
      dispatch(entryActions.addLabelToFilterInCurrentBoard(labelId));
    },
    [dispatch],
  );

  const handleLabelDeselect = useCallback(
    (labelId) => {
      dispatch(entryActions.removeLabelFromFilterInCurrentBoard(labelId));
    },
    [dispatch],
  );

  const handleLabelClick = useCallback(
    ({
      currentTarget: {
        dataset: { id: labelId },
      },
    }) => {
      dispatch(entryActions.removeLabelFromFilterInCurrentBoard(labelId));
    },
    [dispatch],
  );

  const handleReleaseSelect = useCallback(
    (releaseId) => {
      dispatch(entryActions.addReleaseToFilterInCurrentBoard(releaseId));
    },
    [dispatch],
  );

  const handleReleaseDeselect = useCallback(
    (releaseId) => {
      dispatch(entryActions.removeReleaseFromFilterInCurrentBoard(releaseId));
    },
    [dispatch],
  );

  const handleSearchChange = useCallback(
    (_, { value }) => {
      setSearch(value);
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);
  }, []);

  const handleSearchKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        cancelSearch();
      }
    },
    [cancelSearch],
  );

  const handleSearchBlur = useCallback(() => {
    setIsSearchFocused(false);
  }, []);

  const handleCancelSearchClick = useCallback(() => {
    cancelSearch();
  }, [cancelSearch]);

  useDidUpdate(() => {
    setSearch(board.search);
  }, [board.search]);

  const BoardMembershipsPopup = usePopup(BoardMembershipsStep);
  const LabelsPopup = usePopup(LabelsStep);
  const ReleasesPopup = usePopup(BoardReleasesFilterStep);
  const StoryPointsSummaryPopup = usePopup(StoryPointsSummaryStep);

  const isSearchActive = search || isSearchFocused;

  return (
    <>
      <span className={styles.filter}>
        <BoardMembershipsPopup
          currentUserIds={userIds}
          title="common.filterByMembers"
          onUserSelect={handleUserSelect}
          onUserDeselect={handleUserDeselect}
        >
          <button type="button" className={styles.filterButton}>
            <span className={styles.filterTitle}>{`${t('common.members')}:`}</span>
            {userIds.length === 0 && <span className={styles.filterLabel}>{t('common.all')}</span>}
          </button>
        </BoardMembershipsPopup>
        {userIds.length === 0 && withCurrentUserSelector && (
          <button type="button" className={styles.filterButton} onClick={handleCurrentUserSelect}>
            <span className={styles.filterLabel}>
              <Icon fitted name="target" className={styles.filterLabelIcon} />
            </span>
          </button>
        )}
        {userIds.map((userId) => (
          <span key={userId} className={styles.filterItem}>
            <UserAvatar id={userId} size="tiny" onClick={handleUserClick} />
          </span>
        ))}
      </span>
      <span className={styles.filter}>
        <LabelsPopup
          currentIds={labelIds}
          title="common.filterByLabels"
          onSelect={handleLabelSelect}
          onDeselect={handleLabelDeselect}
        >
          <button type="button" className={styles.filterButton}>
            <span className={styles.filterTitle}>{`${t('common.labels')}:`}</span>
            {labelIds.length === 0 && <span className={styles.filterLabel}>{t('common.all')}</span>}
          </button>
        </LabelsPopup>
        {labelIds.map((labelId) => (
          <span key={labelId} className={styles.filterItem}>
            <LabelChip id={labelId} size="small" onClick={handleLabelClick} />
          </span>
        ))}
      </span>

      <span className={styles.filter}>
        <ReleasesPopup
          currentIds={releaseIds}
          title="common.filterByReleases"
          onSelect={handleReleaseSelect}
          onDeselect={handleReleaseDeselect}
        >
          <button type="button" className={styles.filterButton}>
            <span className={styles.filterTitle}>{`${t('common.releases')}:`}</span>
            {releaseIds.length === 0 && (
              <span className={styles.filterLabel}>{t('common.all')}</span>
            )}
            {releaseIds.length > 0 && (
              <span className={styles.filterLabel}>{releaseIds.length}</span>
            )}
          </button>
        </ReleasesPopup>
      </span>

      <span className={styles.filter}>
        <StoryPointsSummaryPopup>
          <button type="button" className={styles.filterButton}>
            <span className={styles.filterTitle}>Story Points</span>
          </button>
        </StoryPointsSummaryPopup>
      </span>

      <span className={styles.filter}>
        <Input
          ref={handleSearchFieldRef}
          value={search}
          placeholder={t('common.searchCards')}
          maxLength={128}
          icon={
            isSearchActive ? (
              <Icon link name="cancel" onClick={handleCancelSearchClick} />
            ) : (
              'search'
            )
          }
          className={classNames(styles.search, !isSearchActive && styles.searchInactive)}
          onFocus={handleSearchFocus}
          onKeyDown={handleSearchKeyDown}
          onChange={handleSearchChange}
          onBlur={handleSearchBlur}
        />
      </span>
    </>
  );
});

export default Filters;
