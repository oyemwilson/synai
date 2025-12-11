import { signup, verifyOTP, login, getProfile, resendOTP, onboarding, generateFinancialPlan, updateProfile, changePassword, forgotPassword, resetPassword } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

// Schemas for request validation
const signupSchema = {
  body: {
    type: 'object',
    required: ['username', 'email', 'password'],
    properties: {
      username: { type: 'string' },
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 }
    }
  }
};

const verifyOTPSchema = {
  body: {
    type: 'object',
    required: ['email', 'otp'],
    properties: {
      email: { type: 'string', format: 'email' },
      otp: { type: 'string' }
    }
  }
};

const resendOTPSchema = {
  body: {
    type: 'object',
    required: ['email'],
    properties: {
      email: { type: 'string', format: 'email' }
    }
  }
};

const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' }
    }
  }
};

const onboardingSchema = {
  body: {
    type: 'object',
    required: ['age', 'retirementAge', 'monthlyIncome', 'averageExpenses', 'employmentType', 'relationshipStatus'],
    properties: {
      age: { type: 'number' },
      retirementAge: { type: 'number' },
      monthlyIncome: { type: 'number' },
      averageExpenses: { type: 'number' },
      employmentType: { type: 'string', enum: ['salary', 'freelancer', 'business'] },
      businessDetails: {
        type: 'object',
        properties: {
          equityDebtRatio: { type: 'number' },
          revenueTrends: { type: 'array', items: { type: 'number' } },
        },
      },
      familyDetails: {
        type: 'object',
        properties: {
          children: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                age: { type: 'number' },
                educationGoal: { type: 'string', enum: ['local', 'abroad'] },
              },
            },
          },
        },
      },
      relationshipStatus: { type: 'string', enum: ['single', 'married', 'divorced'] },
    },
  },
};

const updateProfileSchema = {
  body: {
    type: 'object',
    properties: {
      username: { type: 'string' },
      // Add other updatable fields here (e.g., phoneNumber, address)
    }
  }
};

const changePasswordSchema = {
  body: {
    type: 'object',
    required: ['oldPassword', 'newPassword'],
    properties: {
      oldPassword: { type: 'string' },
      newPassword: { type: 'string', minLength: 6 }
    }
  }
};

const forgotPasswordSchema = {
  body: {
    type: 'object',
    required: ['email'],
    properties: {
      email: { type: 'string', format: 'email' }
    }
  }
};

const resetPasswordSchema = {
  body: {
    type: 'object',
    required: ['token', 'newPassword'], // Assuming you verify a token via body or query
    properties: {
      token: { type: 'string' },
      newPassword: { type: 'string', minLength: 6 }
    }
  }
};

export default async function (fastify, opts) {
  // Public Routes
  fastify.post('/signup', { schema: signupSchema }, signup);
  fastify.post('/verify-otp', { schema: verifyOTPSchema }, verifyOTP);
  fastify.post('/resend-otp', { schema: resendOTPSchema }, resendOTP);
  fastify.post('/login', { schema: loginSchema }, login);
  
  // New Public Routes (Password Recovery)
  fastify.post('/forgot-password', { schema: forgotPasswordSchema }, forgotPassword);
  fastify.post('/reset-password', { schema: resetPasswordSchema }, resetPassword);

  // Protected Routes
  fastify.get('/profile', { preHandler: [authMiddleware] }, getProfile);
  
  // New Protected Routes
  fastify.put('/profile', { schema: updateProfileSchema, preHandler: [authMiddleware] }, updateProfile);
  fastify.post('/change-password', { schema: changePasswordSchema, preHandler: [authMiddleware] }, changePassword);

  // Onboarding & Logic
  fastify.post('/generate-plan', { preHandler: [authMiddleware] }, generateFinancialPlan);
  fastify.post('/onboarding', { schema: onboardingSchema, preHandler: [authMiddleware] }, onboarding);
}