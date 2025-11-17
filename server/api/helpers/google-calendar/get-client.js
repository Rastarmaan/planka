/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { google } = require('googleapis');
const crypto = require('crypto');

module.exports = {
  inputs: {
    sync: {
      type: 'ref',
      required: true,
    },
  },

  exits: {
    tokenRefreshFailed: {},
  },

  async fn(inputs) {
    const { sync: syncInput } = inputs;
    let sync = syncInput;

    if (sync && typeof sync === 'object' && sync.sync && Object.keys(sync).length === 1) {
      sync = sync.sync;
    }

    let freshSync = sync;

    const tokensLookEncrypted =
      (sync && sync.accessToken && sync.accessToken.length > 300) ||
      (sync && sync.accessToken && sync.accessToken.includes('aes-256-gcm$'));

    const tokensLookValid =
      sync &&
      sync.accessToken &&
      sync.accessToken.length > 100 &&
      sync.accessToken.length < 300 &&
      !sync.accessToken.includes('aes-256-gcm$') &&
      !sync.accessToken.includes('$$') &&
      sync.refreshToken &&
      sync.refreshToken.length > 50 &&
      sync.refreshToken.length < 300 &&
      !sync.refreshToken.includes('aes-256-gcm$');

    const shouldRefetch = !sync || !sync.id || (tokensLookEncrypted && !tokensLookValid);

    if (shouldRefetch) {
      if (sync && sync.id) {
        freshSync = await GoogleCalendarSync.findOne({ id: sync.id });
      } else if (sync && sync.userId) {
        freshSync = await GoogleCalendarSync.findOne({ userId: sync.userId });
      } else {
        sails.log.error('[Google Calendar Get Client] Cannot re-fetch sync: no id or userId');
        throw 'tokenRefreshFailed';
      }

      if (!freshSync) {
        sails.log.error('[Google Calendar Get Client] Sync not found after re-fetch');
        throw 'tokenRefreshFailed';
      }
    } else if (freshSync && !freshSync.id && freshSync.userId) {
      const syncWithId = await GoogleCalendarSync.findOne({ userId: freshSync.userId });
      if (syncWithId && syncWithId.id) {
        freshSync.id = syncWithId.id;
      }
    }

    // If tokens are still encrypted, try manual decryption
    if (freshSync.accessToken && freshSync.accessToken.length > 300) {
      try {
        const encryptionKey = sails.config.models.dataEncryptionKeys.default;
        if (!encryptionKey) {
          throw new Error('Encryption key not found in config');
        }

        const keyBuffer = Buffer.from(encryptionKey, 'base64');
        if (keyBuffer.length !== 32) {
          throw new Error('Invalid encryption key length');
        }

        // Decrypt access token
        if (freshSync.accessToken) {
          try {
            let encryptedData;
            let iv;
            let authTag;
            let ciphertext;

            if (freshSync.accessToken.includes('$')) {
              const encryptedParts = freshSync.accessToken.split('$');

              if (encryptedParts[0].startsWith('YWVzLTI1Ni')) {
                try {
                  Buffer.from(encryptedParts[0], 'base64').toString('utf8');
                } catch (e) {
                  // Ignore header decode error
                }

                if (encryptedParts.length >= 3) {
                  const ivBase64 = encryptedParts[1];
                  const dataBase64 = encryptedParts.slice(2).join('$');
                  const ivBuffer = Buffer.from(ivBase64, 'base64');
                  const dataBuffer = Buffer.from(dataBase64, 'base64');

                  encryptedData = Buffer.concat([ivBuffer, dataBuffer]);
                } else if (encryptedParts.length === 2) {
                  encryptedData = Buffer.from(encryptedParts[1], 'base64');
                } else {
                  throw new Error(`Unexpected token format: ${encryptedParts.length} parts`);
                }
              } else if (encryptedParts.length >= 2 && encryptedParts[0] === 'aes-256-gcm') {
                const dataPart = encryptedParts[encryptedParts.length - 1];
                encryptedData = Buffer.from(dataPart, 'base64');
              } else {
                try {
                  encryptedData = Buffer.from(encryptedParts[encryptedParts.length - 1], 'base64');
                } catch (e) {
                  throw new Error('Invalid encryption format with $ separator');
                }
              }
            } else {
              try {
                encryptedData = Buffer.from(freshSync.accessToken, 'base64');
              } catch (e) {
                throw new Error('Token is not in expected encryption format (not base64)');
              }
            }

            if (encryptedData.length >= 28) {
              iv = encryptedData.slice(0, 12);
              authTag = encryptedData.slice(-16);
              ciphertext = encryptedData.slice(12, -16);

              const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
              decipher.setAuthTag(authTag);

              try {
                let decrypted = decipher.update(ciphertext, null, 'utf8');
                decrypted += decipher.final('utf8');
                freshSync.accessToken = decrypted;
              } catch (decryptError) {
                throw new Error(
                  'Token decryption failed. Please reconnect your Google Calendar account.',
                );
              }
            } else {
              throw new Error(`Invalid encrypted data length: ${encryptedData.length} bytes`);
            }
          } catch (decryptErr) {
            throw 'tokenRefreshFailed';
          }
        }

        if (freshSync.refreshToken) {
          try {
            let encryptedData;
            let iv;
            let authTag;
            let ciphertext;

            if (freshSync.refreshToken.includes('$')) {
              const encryptedParts = freshSync.refreshToken.split('$');

              if (encryptedParts[0].startsWith('YWVzLTI1Ni')) {
                if (encryptedParts.length >= 3) {
                  const ivBase64 = encryptedParts[1];
                  const dataBase64 = encryptedParts.slice(2).join('$');
                  const ivBuffer = Buffer.from(ivBase64, 'base64');
                  const dataBuffer = Buffer.from(dataBase64, 'base64');
                  encryptedData = Buffer.concat([ivBuffer, dataBuffer]);
                } else if (encryptedParts.length === 2) {
                  encryptedData = Buffer.from(encryptedParts[1], 'base64');
                } else {
                  throw new Error(`Unexpected token format: ${encryptedParts.length} parts`);
                }
              } else if (encryptedParts.length >= 2 && encryptedParts[0] === 'aes-256-gcm') {
                const dataPart = encryptedParts[encryptedParts.length - 1];
                encryptedData = Buffer.from(dataPart, 'base64');
              } else {
                try {
                  encryptedData = Buffer.from(encryptedParts[encryptedParts.length - 1], 'base64');
                } catch (e) {
                  throw new Error('Invalid encryption format with $ separator');
                }
              }
            } else {
              try {
                encryptedData = Buffer.from(freshSync.refreshToken, 'base64');
              } catch (e) {
                throw new Error('Token is not in expected encryption format (not base64)');
              }
            }

            if (encryptedData.length >= 28) {
              iv = encryptedData.slice(0, 12);
              authTag = encryptedData.slice(-16);
              ciphertext = encryptedData.slice(12, -16);

              const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
              decipher.setAuthTag(authTag);

              let decrypted = decipher.update(ciphertext, null, 'utf8');
              decrypted += decipher.final('utf8');
              freshSync.refreshToken = decrypted;
              sails.log.info('[Google Calendar Get Client] Successfully decrypted refresh token');
            }
          } catch (decryptErr) {
            sails.log.error(
              '[Google Calendar Get Client] Error decrypting refresh token:',
              decryptErr,
            );
          }
        }
      } catch (err) {
        throw 'tokenRefreshFailed';
      }
    }

    const oauth2Client = new google.auth.OAuth2(
      sails.config.custom.googleOAuthClientId,
      sails.config.custom.googleOAuthClientSecret,
      sails.config.custom.googleOAuthRedirectUri,
    );

    const looksEncrypted = freshSync.accessToken && freshSync.accessToken.includes('aes-256-gcm$');

    if (looksEncrypted) {
      throw 'tokenRefreshFailed';
    }

    if (!freshSync.accessToken || typeof freshSync.accessToken !== 'string') {
      throw 'tokenRefreshFailed';
    }

    const oauthCredentials = {
      access_token: freshSync.accessToken,
    };

    if (freshSync.refreshToken) {
      oauthCredentials.refresh_token = freshSync.refreshToken;
    }

    oauthCredentials.expiry_date = new Date(Date.now() + 55 * 60 * 1000).getTime();

    oauth2Client.setCredentials(oauthCredentials);

    const now = new Date();
    const lastSyncAt = freshSync.lastSyncAt ? new Date(freshSync.lastSyncAt) : null;
    const tokenAge = lastSyncAt ? (now - lastSyncAt) / 1000 / 60 : Infinity;

    if (freshSync.refreshToken && tokenAge > 30 && freshSync.accessToken) {
      try {
        const { credentials: refreshedCredentials } = await oauth2Client.refreshAccessToken();

        if (
          refreshedCredentials.access_token &&
          refreshedCredentials.access_token !== freshSync.accessToken
        ) {
          await GoogleCalendarSync.qm.updateOne(freshSync.id, {
            accessToken: refreshedCredentials.access_token,
            refreshToken: refreshedCredentials.refresh_token || freshSync.refreshToken,
            lastSyncAt: new Date(),
          });

          oauth2Client.setCredentials({
            access_token: refreshedCredentials.access_token,
            refresh_token: refreshedCredentials.refresh_token || freshSync.refreshToken,
          });
        }
      } catch (err) {
        if (freshSync.accessToken) {
          sails.log.warn(
            'Error refreshing Google OAuth token, using existing access token:',
            err.message,
          );
        } else {
          sails.log.error(
            'Error refreshing Google OAuth token and no access token available:',
            err,
          );
          throw 'tokenRefreshFailed';
        }
      }
    } else if (!freshSync.accessToken) {
      sails.log.error('No refresh token and no access token available');
      throw 'tokenRefreshFailed';
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    return {
      calendar,
      calendarId: freshSync.calendarId || 'primary',
    };
  },
};
