/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import { useSearchParams } from 'react-router-dom';

import FiltersStep from '../filters';
import Core from './Core';

const HomePage = React.memo(() => {
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');

  if (view === 'filters') {
    return <FiltersStep />;
  }

  return <Core />;
});

export default HomePage;
