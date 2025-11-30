/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Icon } from 'semantic-ui-react';

import { UserRoles } from '../../../constants/Enums';
import Paths from '../../../constants/Paths';
import selectors from '../../../selectors';
import permissionsApi from '../../../api/permissions';

import styles from './DocumentManagementButton.module.scss';

const DocumentManagementButton = React.memo(() => {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const currentUser = useSelector(selectors.selectCurrentUser);
  const accessToken = useSelector(selectors.selectAccessToken);
  const isAdmin = currentUser && currentUser.role === UserRoles.ADMIN;

  const [hasDocumentAccess, setHasDocumentAccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkDocumentAccess = async () => {
      if (isAdmin) {
        setHasDocumentAccess(true);
        return;
      }

      try {
        const res = await permissionsApi.getMyPermissions({
          Authorization: `Bearer ${accessToken}`,
        });

        if (!mounted) return;

        const items = (res && res.items) || [];
        setHasDocumentAccess(items.length > 0);
      } catch {
        if (mounted) {
          setHasDocumentAccess(false);
        }
      }
    };

    if (currentUser) {
      checkDocumentAccess();
    }

    return () => {
      mounted = false;
    };
  }, [currentUser, isAdmin, accessToken]);

  const handleClick = useCallback(() => {
    navigate(Paths.DOCUMENT_MANAGEMENT);
  }, [navigate]);

  if (!isAdmin && !hasDocumentAccess) {
    return null;
  }

  return (
    <button type="button" className={classNames(styles.button)} onClick={handleClick}>
      <Icon fitted name="file alternate outline" />
      <span className={styles.text}>{t('common.documentManagement', { context: 'title' })}</span>
    </button>
  );
});

export default DocumentManagementButton;
