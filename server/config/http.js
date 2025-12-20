/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * (for additional recommended settings, see `config/env/production.js`)
 *
 * For more information on configuration, check out:
 * https://sailsjs.com/config/http
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerConfig = require('./swagger');

const swaggerSpec = swaggerJsdoc(swaggerConfig);

module.exports.swaggerSpec = swaggerSpec;

const swaggerAssetPatterns = [
  '/swagger-ui.css',
  '/swagger-ui-bundle.js',
  '/swagger-ui-standalone-preset.js',
  '/swagger-ui-init.js',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
];

const isSwaggerRequest = (url) => {
  return (
    url === '/api-docs' ||
    url.startsWith('/api-docs/') ||
    swaggerAssetPatterns.some((pattern) => url === pattern || url.startsWith(pattern))
  );
};

module.exports.http = {
  /**
   *
   * Sails/Express middleware to run for every HTTP request.
   * (Only applies to HTTP requests -- not virtual WebSocket requests.)
   *
   * https://sailsjs.com/documentation/concepts/middleware
   *
   */

  middleware: {
    /**
     *
     * The order in which middleware should be run for HTTP requests.
     * (This Sails app's routes are handled by the "router" middleware below.)
     *
     */
    order: [
      'cookieParser',
      'session',
      'bodyParser',
      'compress',
      'poweredBy',
      'swaggerJson',
      'swaggerUi',
      'router',
      'www',
      'favicon',
    ],

    swaggerJson: (req, res, next) => {
      if (process.env.NODE_ENV !== 'production' && req.url === '/api-docs.json') {
        res.setHeader('Content-Type', 'application/json');
        return res.send(swaggerSpec);
      }
      return next();
    },

    swaggerUi: (req, res, next) => {
      if (process.env.NODE_ENV !== 'production' && isSwaggerRequest(req.url)) {
        const handlers = swaggerUi.serve.concat(
          swaggerUi.setup(swaggerSpec, {
            explorer: true,
            customSiteTitle: 'PLANKA API Documentation',
          }),
        );

        let index = 0;
        const runNext = (err) => {
          if (err) return next(err);
          if (index >= handlers.length) return next();
          const handler = handlers[index];
          index += 1;
          return handler(req, res, runNext);
        };
        return runNext();
      }
      return next();
    },

    /**
     *
     * The body parser that will handle incoming multipart HTTP requests.
     *
     * https://sailsjs.com/config/http#?customizing-the-body-parser
     *
     */
    // bodyParser: (function _configureBodyParser(){
    //   var skipper = require('skipper');
    //   var middlewareFn = skipper({ strict: true });
    //   return middlewareFn;
    // })(),

    poweredBy: false,
  },
};
