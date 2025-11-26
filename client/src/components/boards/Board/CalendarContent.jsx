/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import { useSelector } from 'react-redux';

import selectors from '../../../selectors';
import CalendarView from './CalendarView';

const CalendarContent = React.memo(() => {
  const cardIds = useSelector(selectors.selectFilteredCardIdsForCurrentBoard);

  return <CalendarView cardIds={cardIds} />;
});

export default CalendarContent;
