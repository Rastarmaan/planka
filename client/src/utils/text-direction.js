/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const RTL_LANGUAGES = new Set([
  'ar',
  'ar-YE',
  'ar-SA',
  'ar-EG',
  'ar-AE',
  'fa',
  'fa-IR',
  'fa-AF',
  'he',
  'he-IL',
  'ur',
  'ur-PK',
  'ku',
  'ku-IQ',
  'yi',
  'dv',
]);

const RTL_REGEX =
  /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

/**
 * Determines if a language code represents an RTL language
 * @param {string} languageCode - Language code (e.g., 'fa-IR', 'ar-YE')
 * @returns {boolean} - True if the language is RTL
 */
export const isRTLLanguage = (languageCode) => {
  if (!languageCode) return false;

  if (RTL_LANGUAGES.has(languageCode)) return true;

  const baseLanguage = languageCode.split('-')[0];
  return RTL_LANGUAGES.has(baseLanguage);
};

/**
 * Determines if text contains RTL characters
 * @param {string} text - Text to analyze
 * @returns {boolean} - True if text contains RTL characters
 */
export const hasRTLCharacters = (text) => {
  if (!text) return false;
  return RTL_REGEX.test(text);
};

/**
 * Gets the appropriate text direction for a given text and language
 * @param {string} text - The text content
 * @param {string} languageCode - Current language code
 * @returns {string} - 'rtl' or 'ltr'
 */
export const getTextDirection = (text, languageCode) => {
  if (isRTLLanguage(languageCode)) {
    return 'rtl';
  }

  if (hasRTLCharacters(text)) {
    return 'rtl';
  }

  return 'ltr';
};

/**
 * Gets CSS properties for proper text direction
 * @param {string} text - The text content
 * @param {string} languageCode - Current language code
 * @returns {object} - CSS properties object
 */
export const getTextDirectionStyles = (text, languageCode) => {
  const direction = getTextDirection(text, languageCode);

  return {
    direction,
    textAlign: direction === 'rtl' ? 'right' : 'left',
    unicodeBidi: 'plaintext',
  };
};
