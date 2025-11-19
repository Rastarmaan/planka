const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { v4: uuid } = require('uuid');

module.exports = {
  inputs: {
    url: {
      type: 'string',
      required: true,
    },
    filename: {
      type: 'string',
      required: true,
    },
    trelloApiKey: {
      type: 'string',
      required: false,
    },
    trelloApiToken: {
      type: 'string',
      required: false,
    },
  },

  exits: {
    success: {
      outputFriendlyName: 'Downloaded file',
      outputType: 'ref',
    },
    downloadError: {
      description: 'Failed to download file',
    },
  },

  fn: async (inputs, exits) => {
    const tempDir = os.tmpdir();
    const tempFilename = `${uuid()}_${inputs.filename}`;
    const tempFilePath = path.join(tempDir, tempFilename);

    try {
      const downloadUrl = inputs.url;
      const headers = {};

      if (inputs.trelloApiKey && inputs.trelloApiToken && inputs.url.includes('trello.com')) {
        headers.Authorization = `OAuth oauth_consumer_key="${inputs.trelloApiKey}", oauth_token="${inputs.trelloApiToken}"`;
      } else if (inputs.url.includes('trello.com')) {
        sails.log.warn(
          `Downloading Trello file WITHOUT credentials: ${inputs.filename} (key: ${!!inputs.trelloApiKey}, token: ${!!inputs.trelloApiToken})`,
        );
      }

      const protocol = downloadUrl.startsWith('https') ? https : http;

      await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(tempFilePath);

        const options = {
          headers,
        };

        protocol
          .get(downloadUrl, options, (response) => {
            sails.log.info(
              `HTTP Response for ${inputs.filename}: ${response.statusCode} ${response.statusMessage}`,
            );

            if (response.statusCode === 401 || response.statusCode === 403) {
              file.close();
              try {
                fs.unlinkSync(tempFilePath);
              } catch (e) {
                // Ignore
              }
              sails.log.error(
                `Authentication failed for ${inputs.filename}: ${response.statusCode} - Check if Trello API key/token are valid`,
              );
              reject(new Error(`AUTH_ERROR: ${response.statusCode}`));
              return;
            }

            if (response.statusCode === 301 || response.statusCode === 302) {
              file.close();
              try {
                fs.unlinkSync(tempFilePath);
              } catch (e) {
                // Ignore
              }

              const redirectUrl = response.headers.location;
              const redirectProtocol = redirectUrl.startsWith('https') ? https : http;

              const redirectOptions = {
                headers,
              };

              redirectProtocol
                .get(redirectUrl, redirectOptions, (redirectResponse) => {
                  if (redirectResponse.statusCode === 401 || redirectResponse.statusCode === 403) {
                    reject(new Error(`AUTH_ERROR: ${redirectResponse.statusCode}`));
                    return;
                  }

                  if (redirectResponse.statusCode !== 200) {
                    reject(
                      new Error(
                        `HTTP ${redirectResponse.statusCode}: ${redirectResponse.statusMessage}`,
                      ),
                    );
                    return;
                  }

                  const redirectFile = fs.createWriteStream(tempFilePath);
                  redirectResponse.pipe(redirectFile);

                  redirectFile.on('finish', () => {
                    redirectFile.close();
                    resolve();
                  });
                })
                .on('error', (err) => {
                  reject(err);
                });

              return;
            }

            if (response.statusCode !== 200) {
              file.close();
              try {
                fs.unlinkSync(tempFilePath);
              } catch (e) {
                // Ignore
              }
              reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
              return;
            }

            response.pipe(file);

            file.on('finish', () => {
              file.close();
              resolve();
            });
          })
          .on('error', (err) => {
            file.close();
            try {
              fs.unlinkSync(tempFilePath);
            } catch (e) {
              // Ignore
            }
            reject(err);
          });

        file.on('error', (err) => {
          file.close();
          try {
            fs.unlinkSync(tempFilePath);
          } catch (e) {
            // Ignore
          }
          reject(err);
        });
      });

      const stats = fs.statSync(tempFilePath);

      const fileObj = {
        fd: tempFilePath,
        size: stats.size,
        type: '',
        filename: inputs.filename,
        status: 'finished',
        field: 'file',
        extra: {},
      };

      return exits.success(fileObj);
    } catch (error) {
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      } catch (cleanupError) {
        // Ignore cleanup errors
      }

      sails.log.error(`Failed to download file "${inputs.filename}":`, error.message || error);
      if (error.stack && !error.message.includes('AUTH_ERROR')) {
        sails.log.error('Stack trace:', error.stack);
      }

      return exits.downloadError();
    }
  },
};
