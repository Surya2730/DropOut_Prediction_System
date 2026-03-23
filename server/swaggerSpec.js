const PORT = process.env.PORT || 5000;

// Swagger/OpenAPI spec for the Express backend.
// This is intentionally kept simple and focuses on the main routes your UI uses.
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'DropOut Prediction API',
    version: '1.0.0',
    description: 'API documentation for the Student Dropout Prediction System (MERN + ML service).',
  },
  servers: [
    {
      url: process.env.API_BASE_URL || `http://localhost:${PORT}`,
    },
  ],
  tags: [
    { name: 'Students', description: 'Student record and verification endpoints' },
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Prediction', description: 'ML/heuristic prediction endpoints' },
  ],
  paths: {
    '/api/students': {
      get: {
        tags: ['Students'],
        summary: 'Get students',
        description: 'Optionally filter by role and whether the student is fully verified.',
        parameters: [
          {
            in: 'query',
            name: 'role',
            schema: { type: 'string' },
            required: false,
            example: 'Faculty',
          },
          {
            in: 'query',
            name: 'requireVerified',
            schema: { type: 'string', enum: ['true', 'false'] },
            required: false,
            example: 'true',
          },
        ],
        responses: {
          '200': {
            description: 'List of students',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Student' },
                },
              },
            },
          },
          '500': {
            description: 'Server error',
          },
        },
      },
      post: {
        tags: ['Students'],
        summary: 'Add or update a student',
        description: 'Adds a new student or updates an existing student by `registerNo`.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/StudentCreateOrUpdate' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Student created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Student' },
              },
            },
          },
          '200': {
            description: 'Student updated',
          },
          '400': {
            description: 'Invalid input',
          },
        },
      },
    },

    '/api/students/{id}': {
      get: {
        tags: ['Students'],
        summary: 'Get a student by id',
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: { type: 'string' },
            required: true,
          },
        ],
        responses: {
          '200': {
            description: 'Student record',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Student' },
              },
            },
          },
          '404': { description: 'Student not found' },
          '500': { description: 'Server error' },
        },
      },
      put: {
        tags: ['Students'],
        summary: 'Update a student',
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: { type: 'string' },
            required: true,
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/StudentCreateOrUpdate' },
            },
          },
        },
        responses: {
          '200': { description: 'Student updated' },
          '400': { description: 'Invalid input' },
          '404': { description: 'Student not found' },
        },
      },
      delete: {
        tags: ['Students'],
        summary: 'Delete a student',
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: { type: 'string' },
            required: true,
          },
        ],
        responses: {
          '200': { description: 'Student removed' },
          '404': { description: 'Student not found' },
          '500': { description: 'Server error' },
        },
      },
      patch: {
        tags: ['Students'],
        summary: 'Student verification is available via dedicated route',
        responses: {
          '405': { description: 'Method not allowed' },
        },
      },
    },

    '/api/students/{id}/verify': {
      patch: {
        tags: ['Students'],
        summary: 'Verify student (coordinator action)',
        description: 'Updates academic/lab/placement verification status for a student.',
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: { type: 'string' },
            required: true,
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/StudentVerifyRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Updated student record',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Student' },
              },
            },
          },
          '400': { description: 'Invalid input' },
          '404': { description: 'Student not found' },
        },
      },
    },

    '/api/students/profile': {
      patch: {
        tags: ['Students'],
        summary: 'Update student profile (by email)',
        description: 'Student self-update route. Updates the student record matching `email`.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/StudentProfileUpdate' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Student updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Student' },
              },
            },
          },
          '201': { description: 'Student created (if not found)' },
          '400': { description: 'Invalid input' },
        },
      },
    },

    '/api/students/upload-certificate': {
      post: {
        tags: ['Students'],
        summary: 'Upload income certificate',
        description: 'Uploads an income certificate (image or PDF).',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  certificate: { type: 'string', format: 'binary' },
                },
                required: ['certificate'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Uploaded file path',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    filePath: { type: 'string', example: '/uploads/16999999999-filename.pdf' },
                  },
                },
              },
            },
          },
          '400': { description: 'File upload failed' },
        },
      },
    },

    '/api/predict': {
      post: {
        tags: ['Prediction'],
        summary: 'Predict dropout risk',
        description: 'Runs ML prediction (or heuristic fallback) and returns risk status.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              // Body includes many student fields; we document it as a generic object.
              schema: { type: 'object', additionalProperties: true },
            },
          },
        },
        responses: {
          '200': {
            description: 'Prediction completed successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PredictResponse' },
              },
            },
          },
          '400': { description: 'Student must be fully verified' },
          '500': { description: 'Server error' },
        },
      },
    },

    '/api/auth/google': {
      post: {
        tags: ['Auth'],
        summary: 'Google login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GoogleLoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'User info',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AuthUser' } },
            },
          },
          '500': { description: 'Server error' },
        },
      },
    },

    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email/password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'User info',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AuthUser' } },
            },
          },
          '401': { description: 'Invalid email or password' },
          '500': { description: 'Server error' },
        },
      },
    },

    '/api/auth/create-student': {
      post: {
        tags: ['Auth'],
        summary: 'Create a student user account (Faculty only)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateStudentRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Student account created',
          },
          '400': { description: 'User already exists' },
          '500': { description: 'Server error' },
        },
      },
    },

    '/api/auth/update-user/{id}': {
      put: {
        tags: ['Auth'],
        summary: 'Update user details',
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateUserRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'User updated successfully' },
          '404': { description: 'User not found' },
          '400': { description: 'Email already in use' },
          '500': { description: 'Server error' },
        },
      },
    },

    '/api/auth/delete-user/{id}': {
      delete: {
        tags: ['Auth'],
        summary: 'Delete user account by id',
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'User account deleted successfully' },
          '404': { description: 'User not found' },
          '500': { description: 'Server error' },
        },
      },
    },

    '/api/auth/delete-user-by-email/{email}': {
      delete: {
        tags: ['Auth'],
        summary: 'Delete user account by email',
        parameters: [
          { in: 'path', name: 'email', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'User account deleted successfully' },
          '404': { description: 'User not found' },
          '500': { description: 'Server error' },
        },
      },
    },

    '/api/auth/migrate-students': {
      post: {
        tags: ['Auth'],
        summary: 'Migrate existing student users to student records',
        responses: {
          '200': { description: 'Migration completed' },
          '500': { description: 'Migration failed' },
        },
      },
    },
  },
  components: {
    schemas: {
      Student: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          registerNo: { type: 'string' },
          department: { type: 'string' },
          year: { type: 'string' },
          attendance: { type: 'number' },
          completedSemesters: { type: 'number' },
          sem1Marks: { type: 'number' },
          sem2Marks: { type: 'number' },
          sem3Marks: { type: 'number' },
          sem4Marks: { type: 'number' },
          sem5Marks: { type: 'number' },
          sem6: { type: 'number' },
          sem7: { type: 'number' },
          sem8: { type: 'number' },
          cgpa: { type: 'number' },
          backlogs: { type: 'number' },
          riskStatus: { type: 'string', example: 'Not Predicted' },
          isVerified: { type: 'boolean' },
          academicVerification: { type: 'string', example: 'Pending' },
          labVerification: { type: 'string', example: 'Pending' },
          placementVerification: { type: 'string', example: 'Pending' },
          incomeCertificate: { type: 'string' },
        },
      },
      StudentCreateOrUpdate: {
        type: 'object',
        required: ['name', 'email', 'registerNo', 'department', 'attendance', 'cgpa', 'backlogs'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          registerNo: { type: 'string' },
          department: { type: 'string' },
          year: { type: 'string' },
          attendance: { type: 'number' },
          completedSemesters: { type: 'number' },
          sem1Marks: { type: 'number' },
          sem2Marks: { type: 'number' },
          sem3Marks: { type: 'number' },
          sem4Marks: { type: 'number' },
          sem5Marks: { type: 'number' },
          sem6: { type: 'number' },
          sem7: { type: 'number' },
          sem8: { type: 'number' },
          cgpa: { type: 'number' },
          isAboveAverage: { type: 'boolean' },
          avgClassMark: { type: 'number' },
          backlogs: { type: 'number' },
          annualIncome: { type: 'number' },
          hasUnpaidFees: { type: 'boolean' },
          unpaidAmount: { type: 'number' },
          isPWD: { type: 'boolean' },
          academicParticipation: { type: 'boolean' },
          sportsInterest: { type: 'boolean' },
          sportsField: { type: 'string' },
          isTeamMemberOrSubstitute: { type: 'string' },
          hasTalents: { type: 'boolean' },
          specialLabParticipation: { type: 'boolean' },
          specialLabName: { type: 'string' },
          eventParticipation: { type: 'boolean' },
          eventWinner: { type: 'boolean' },
          placementTraining: { type: 'boolean' },
          placementTrainingAttendance: { type: 'number' },
          isInterestedInNIP: { type: 'boolean' },
          isNotInterestedInPlacement: { type: 'boolean' },
          placementPercentage: { type: 'number' },
          avgMockScore: { type: 'number' },
          internshipStatus: { type: 'boolean' },
          isPaidInternship: { type: 'boolean' },
          stipendAmount: { type: 'number' },
          stressLevel: { type: 'number' },
          depressionSigns: { type: 'boolean' },
        },
      },
      StudentVerifyRequest: {
        type: 'object',
        required: ['type', 'status'],
        properties: {
          type: { type: 'string', enum: ['academic', 'lab', 'placement'], example: 'academic' },
          status: { type: 'string', enum: ['Verified', 'Rejected', 'Pending'], example: 'Verified' },
          remark: { type: 'string', nullable: true, example: 'Good performance' },
        },
      },
      StudentProfileUpdate: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string' },
          name: { type: 'string' },
          attendance: { type: 'number' },
          cgpa: { type: 'number' },
          backlogs: { type: 'number' },
          specialLabParticipation: { type: 'boolean' },
          placementTraining: { type: 'boolean' },
          placementTrainingAttendance: { type: 'number' },
          isNotInterestedInPlacement: { type: 'boolean' },
          internshipStatus: { type: 'boolean' },
        },
      },
      PredictResponse: {
        type: 'object',
        properties: {
          riskStatus: { type: 'string', example: 'High Risk' },
          message: { type: 'string' },
          heuristicScore: { type: 'number' },
          threshold: { type: 'number' },
        },
      },
      GoogleLoginRequest: {
        type: 'object',
        required: ['email', 'name', 'googleId'],
        properties: {
          email: { type: 'string' },
          name: { type: 'string' },
          googleId: { type: 'string' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string' },
          password: { type: 'string' },
        },
      },
      CreateStudentRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          password: { type: 'string' },
        },
      },
      UpdateUserRequest: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          password: { type: 'string', description: 'Optional. Used only if provided.' },
        },
      },
      AuthUser: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string' },
        },
      },
    },
  },
};

module.exports = swaggerSpec;

