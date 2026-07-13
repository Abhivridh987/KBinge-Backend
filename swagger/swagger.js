const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const PORT = process.env.PORT || 5050;
console.log('Swagger PORT : ', PORT);
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'KBinge API Documentation',
    version: '1.0.0',
    description: 'Swagger docs for the KBinge backend API'
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: 'Local server'
    }
  ],
  tags: [
    { name: 'Auth', description: 'Authentication and user account endpoints' },
    { name: 'Movies', description: 'Movie listing and search endpoints' },
    { name: 'Comments', description: 'Movie comment endpoints' },
    { name: 'Admin', description: 'Administrative movie management endpoints' }
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token'
      }
    },
    schemas: require('./schemas')
  },
  paths: {
    ...require('./paths/auth'),
    ...require('./paths/movies'),
    ...require('./paths/comments'),
    ...require('./paths/admin')
  }
};

const options = {
  definition: swaggerDefinition,
  apis: []
};

module.exports = swaggerJsdoc(options);
