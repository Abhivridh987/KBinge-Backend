module.exports = {
  '/comments/comments/{movieId}': {
    get: {
      tags: ['Comments'],
      summary: 'Get comments for a movie',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'movieId',
          required: true,
          schema: { type: 'string' },
          description: 'Movie ObjectId'
        }
      ],
      responses: {
        200: { description: 'Comments retrieved successfully' },
        400: { description: 'Invalid movie id', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        404: { description: 'Movie not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  '/comments/user-comments/{userId}': {
    get: {
      tags: ['Comments'],
      summary: 'Get comments made by a user',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'userId',
          required: true,
          schema: { type: 'string' },
          description: 'User ObjectId'
        }
      ],
      responses: {
        200: { description: 'User comments retrieved successfully' },
        400: { description: 'Invalid user id', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  '/comments/add-comment': {
    post: {
      tags: ['Comments'],
      summary: 'Add a comment for a movie',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AddCommentRequest' }
          }
        }
      },
      responses: {
        201: { description: 'Comment added successfully' },
        400: { description: 'Invalid comment payload', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        404: { description: 'Movie or user not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        409: { description: 'User already commented on this movie', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  '/comments/edit-comment/{commentId}': {
    put: {
      tags: ['Comments'],
      summary: 'Edit an existing comment',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'commentId',
          required: true,
          schema: { type: 'string' },
          description: 'Comment ObjectId'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/EditCommentRequest' }
          }
        }
      },
      responses: {
        200: { description: 'Comment updated successfully' },
        400: { description: 'Invalid comment payload', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        403: { description: 'Unauthorized to edit this comment', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        404: { description: 'Comment not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  '/comments/delete-comment/{commentId}': {
    delete: {
      tags: ['Comments'],
      summary: 'Delete an existing comment',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'commentId',
          required: true,
          schema: { type: 'string' },
          description: 'Comment ObjectId'
        }
      ],
      responses: {
        200: { description: 'Comment deleted successfully' },
        403: { description: 'Unauthorized to delete this comment', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        404: { description: 'Comment not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  }
};
