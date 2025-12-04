/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

export const formatDate = (date) => {
  if (!date) return '';

  const dateObj = new Date(date);

  const today = new Date();
  const isToday = dateObj.toDateString() === today.toDateString();

  if (isToday) {
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const isThisYear = dateObj.getFullYear() === today.getFullYear();

  if (isThisYear) {
    return dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  return dateObj.toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Check if a card name represents a divider
 * Divider patterns: --- or ___ (3 or more dashes/underscores)
 */
export const isDividerCard = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return /^-{3,}$/.test(trimmed) || /^_{3,}$/.test(trimmed);
};

export default {
  formatBytes,
  formatDate,
  isDividerCard,
};
