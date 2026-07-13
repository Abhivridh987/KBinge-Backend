module.exports = {
  ErrorResponse: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Validation failed' },
      status: { type: 'integer', example: 400 },
      ok: { type: 'boolean', example: false },
      error: { type: 'object', nullable: true },
      origin: { type: 'string', nullable: true }
    }
  },
  SuccessResponse: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Operation completed successfully' },
      status: { type: 'integer', example: 200 },
      ok: { type: 'boolean', example: true }
    }
  },
  User: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '64d0f1d3a4b4c7c0e9f8a123' },
      username: { type: 'string', example: 'john_doe' },
      email: { type: 'string', format: 'email', example: 'john@example.com' },
      admin: { type: 'boolean', example: false },
      DOB: { type: 'string', format: 'date', example: '1995-05-10' },
      profilePic: { type: 'string', example: 'default.webp' },
      favorites: { type: 'array', items: { type: 'string' } }
    }
  },
  Movie: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '64d0f1d3a4b4c7c0e9f8a123' },
      Name: { type: 'string', example: 'Inception' },
      Year: { type: 'integer', example: 2010 },
      Genre: { type: 'string', example: 'Sci-Fi' },
      'Main Cast': { type: 'string', example: 'Leonardo DiCaprio' },
      Sinopsis: { type: 'string', example: 'A thief enters dreams.' },
      Score: { type: 'number', example: 8.8 },
      'Content Rating': { type: 'string', example: 'PG-13' },
      Tags: { type: 'string', example: 'thriller, mind-bending' },
      Network: { type: 'string', example: 'WB' },
      'img url': { type: 'string', example: 'https://example.com/poster.jpg' },
      Episode: { type: 'string', example: '1' },
      topPicks: { type: 'boolean', example: true }
    }
  },
  Comment: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '64d0f1d3a4b4c7c0e9f8a123' },
      user: { $ref: '#/components/schemas/User' },
      movie: { $ref: '#/components/schemas/Movie' },
      comment: { type: 'string', example: 'Great movie!' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  SignUpRequest: {
    type: 'object',
    required: ['username', 'email', 'password', 'DOB', 'otpId'],
    properties: {
      username: { type: 'string', example: 'john_doe' },
      email: { type: 'string', format: 'email', example: 'john@example.com' },
      password: { type: 'string', example: 'password123' },
      DOB: { type: 'string', format: 'date', example: '1995-05-10' },
      otpId: { type: 'string', example: '64d0f1d3a4b4c7c0e9f8a123' }
    }
  },
  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'john@example.com' },
      password: { type: 'string', example: 'password123' }
    }
  },
  OTPRequest: {
    type: 'object',
    required: ['email', 'purpose'],
    properties: {
      email: { type: 'string', format: 'email', example: 'john@example.com' },
      purpose: { type: 'string', enum: ['sign-up', 'forgot-password'], example: 'sign-up' }
    }
  },
  VerifyOTPRequest: {
    type: 'object',
    required: ['otpId', 'otp'],
    properties: {
      otpId: { type: 'string', example: '64d0f1d3a4b4c7c0e9f8a123' },
      otp: { type: 'string', pattern: '^\\d{6}$', example: '123456' }
    }
  },
  ResetPasswordRequest: {
    type: 'object',
    required: ['otpId', 'password', 'email'],
    properties: {
      otpId: { type: 'string', example: '64d0f1d3a4b4c7c0e9f8a123' },
      password: { type: 'string', example: 'newPassword123' },
      email: { type: 'string', format: 'email', example: 'john@example.com' }
    }
  },
  ChangePasswordRequest: {
    type: 'object',
    required: ['oldPassword', 'newPassword'],
    properties: {
      oldPassword: { type: 'string', example: 'oldPassword123' },
      newPassword: { type: 'string', example: 'newPassword123' }
    }
  },
  AddMovieRequest: {
    type: 'object',
    required: ['Name', 'Year', 'Score'],
    properties: {
      Name: { type: 'string', example: 'Interstellar' },
      Year: { type: 'integer', example: 2014 },
      Genre: { type: 'string', example: 'Sci-Fi' },
      'Main Cast': { type: 'string', example: 'Matthew McConaughey' },
      Sinopsis: { type: 'string', example: 'A team travels through space.' },
      Score: { type: 'number', example: 9.0 },
      'Content Rating': { type: 'string', example: 'PG-13' },
      Tags: { type: 'string', example: 'space, epic' },
      Network: { type: 'string', example: 'Paramount' },
      'img url': { type: 'string', example: 'https://example.com/interstellar.jpg' },
      Episode: { type: 'string', example: '1' },
      topPicks: { type: 'boolean', example: true }
    }
  },
  UpdateMovieRequest: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', example: '64d0f1d3a4b4c7c0e9f8a123' },
      Name: { type: 'string', example: 'Interstellar' },
      Year: { type: 'integer', example: 2014 },
      Score: { type: 'number', example: 9.0 },
      topPicks: { type: 'boolean', example: true }
    }
  },
  DeleteMovieRequest: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', example: '64d0f1d3a4b4c7c0e9f8a123' }
    }
  },
  AddCommentRequest: {
    type: 'object',
    required: ['movie', 'comment'],
    properties: {
      movie: { type: 'string', example: '64d0f1d3a4b4c7c0e9f8a123' },
      comment: { type: 'string', example: 'Loved the soundtrack!' }
    }
  },
  EditCommentRequest: {
    type: 'object',
    required: ['comment'],
    properties: {
      comment: { type: 'string', example: 'Updated comment text' }
    }
  }
};
