module.exports = {
  '/auth/': {
    get: {
      tags: ['Auth'],
      summary: 'Auth root health check',
      responses: {
        200: {
          description: 'Auth service is reachable',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' }
            }
          }
        }
      }
    }
  },
  '/auth/signup': {
    post: {
      tags: ['Auth'],
      summary: 'Create a user account',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SignUpRequest' }
          }
        }
      },
      responses: {
        201: {
          description: 'User created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' }
            }
          }
        },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        404: { description: 'OTP session or user not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  '/auth/sign-up/send-otp': {
    post: {
      tags: ['Auth'],
      summary: 'Send OTP for sign-up',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/OTPRequest' }
          }
        }
      },
      responses: {
        200: { description: 'OTP sent successfully' },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        409: { description: 'User already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  '/auth/sign-up/verify-otp': {
    post: {
      tags: ['Auth'],
      summary: 'Verify sign-up OTP',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/VerifyOTPRequest' }
          }
        }
      },
      responses: {
        200: { description: 'OTP verified successfully' },
        400: { description: 'Invalid or expired OTP', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  '/auth/forgot-password/send-otp': {
    post: {
      tags: ['Auth'],
      summary: 'Send OTP for password reset',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/OTPRequest' }
          }
        }
      },
      responses: {
        200: { description: 'OTP sent successfully' },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        404: { description: 'Account not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  '/auth/forgot-password/verify-otp': {
    post: {
      tags: ['Auth'],
      summary: 'Verify password reset OTP',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/VerifyOTPRequest' }
          }
        }
      },
      responses: {
        200: { description: 'OTP verified successfully' },
        400: { description: 'Invalid or expired OTP', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  '/auth/forgot-password/reset': {
    put: {
      tags: ['Auth'],
      summary: 'Reset user password',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ResetPasswordRequest' }
          }
        }
      },
      responses: {
        200: { description: 'Password reset successfully' },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        404: { description: 'Reset session not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Log in a user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/LoginRequest' }
          }
        }
      },
      responses: {
        200: { description: 'Login successful' },
        400: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  '/auth/me': {
    get: {
      tags: ['Auth'],
      summary: 'Get the current authenticated user',
      security: [{ cookieAuth: [] }],
      responses: {
        200: { description: 'Authenticated user data returned' },
        401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  '/auth/change-password': {
    put: {
      tags: ['Auth'],
      summary: 'Change the current user password',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ChangePasswordRequest' }
          }
        }
      },
      responses: {
        200: { description: 'Password changed successfully' },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        404: { description: 'User not found or wrong password', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  '/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Log out the current user',
      security: [{ cookieAuth: [] }],
      responses: {
        200: { description: 'Logout successful' },
        401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  '/auth/change-profile-pic': {
    post: {
      tags: ['Auth'],
      summary: 'Upload a profile picture',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                profilePic: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          }
        }
      },
      responses: {
        200: { description: 'Profile picture uploaded successfully' },
        400: { description: 'No file uploaded', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  '/auth/delete-profile-pic': {
    delete: {
      tags: ['Auth'],
      summary: 'Remove the current profile picture',
      security: [{ cookieAuth: [] }],
      responses: {
        200: { description: 'Profile picture removed successfully' },
        401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  '/auth/show-profile-pic': {
    get: {
      tags: ['Auth'],
      summary: 'Show the current profile picture',
      security: [{ cookieAuth: [] }],
      responses: {
        200: { description: 'HTML page containing the profile image' },
        401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  '/auth/add-to-watchlist': {
    post: {
      tags: ['Auth'],
      summary: 'Add a movie to the current user watchlist',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/WatchlistRequest' }
          }
        }
      },
      responses: {
        200: {
          description: 'Movie added to watchlist',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' }
            }
          }
        },
        401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  '/auth/remove-from-watchlist': {
    delete: {
      tags: ['Auth'],
      summary: 'Remove a movie from the current user watchlist',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/WatchlistRequest' }
          }
        }
      },
      responses: {
        200: {
          description: 'Movie removed from watchlist',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' }
            }
          }
        },
        401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  },
  '/auth/watchlist': {
    get: {
      tags: ['Auth'],
      summary: 'Get the current user watchlist',
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: 'Watchlist fetched successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/WatchlistResponse' }
            }
          }
        },
        401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      }
    }
  }
};
