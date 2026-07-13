module.exports = {
  '/home/movies': {
    get: {
      tags: ['Movies'],
      summary: 'Get all movies',
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: 'List of movies returned',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  ok: { type: 'boolean' },
                  status: { type: 'integer' },
                  message: { type: 'string' },
                  movies: { type: 'array', items: { $ref: '#/components/schemas/Movie' } }
                }
              }
            }
          }
        },
        401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  '/home/movies/search': {
    get: {
      tags: ['Movies'],
      summary: 'Search movies by text query',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'q',
          required: true,
          schema: { type: 'string' },
          description: 'Search text used to match movie fields'
        }
      ],
      responses: {
        200: { description: 'Search results returned' },
        400: { description: 'Search query is required', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  '/home/movies/filter': {
    get: {
      tags: ['Movies'],
      summary: 'Filter movies by query parameters',
      security: [{ cookieAuth: [] }],
      parameters: [
        { in: 'query', name: 'genre', schema: { type: 'string' } },
        { in: 'query', name: 'year', schema: { type: 'integer' } },
        { in: 'query', name: 'minScore', schema: { type: 'number' } },
        { in: 'query', name: 'maxScore', schema: { type: 'number' } },
        { in: 'query', name: 'contentRating', schema: { type: 'string' } },
        { in: 'query', name: 'topPicks', schema: { type: 'boolean' } },
        { in: 'query', name: 'network', schema: { type: 'string' } },
        { in: 'query', name: 'tags', schema: { type: 'string' } }
      ],
      responses: {
        200: { description: 'Filtered results returned' }
      }
    }
  },
  '/home/movies/top-picks': {
    get: {
      tags: ['Movies'],
      summary: 'Get top pick movies',
      security: [{ cookieAuth: [] }],
      responses: {
        200: { description: 'Top pick movies returned' }
      }
    }
  },
  '/home/movies/genres': {
    get: {
      tags: ['Movies'],
      summary: 'Get movies by genre',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'genre',
          required: true,
          schema: { type: 'string' },
          description: 'Comma-separated list of genres'
        }
      ],
      responses: {
        200: { description: 'Movies for requested genres returned' },
        400: { description: 'Genre query required', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  '/home/movies/{id}': {
    get: {
      tags: ['Movies'],
      summary: 'Get a movie by id',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'MongoDB ObjectId of the movie'
        }
      ],
      responses: {
        200: { description: 'Movie returned successfully' },
        400: { description: 'Invalid movie id', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        404: { description: 'Movie not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  }
};
