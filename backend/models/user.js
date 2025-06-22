import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },

  // Step 1: Age & Retirement Goals (Optional until onboarding)
  age: {
    type: Number,
    min: 18, // Validation still applies when provided
  },
  retirementAge: {
    type: Number,
    min: [18, 'Retirement age must be at least 18'],
    validate: {
      validator: function (value) {
        return !this.age || value > this.age; // Only validate if age is set
      },
      message: 'Retirement age must be greater than current age',
    },
  },

  // Step 2: Income & Expenses (Optional until onboarding)
  monthlyIncome: {
    type: Number,
    min: 0,
  },
  averageExpenses: {
    type: Number,
    min: 0,
  },

  // Step 3: Employment Type (Optional until onboarding)
  employmentType: {
    type: String,
    enum: ['salary', 'freelancer', 'business'],
  },

  // Step 4: Business Health (For Entrepreneurs, conditionally required if employmentType is 'business')
  businessDetails: {
    equityDebtRatio: {
      type: Number,
      required: function () {
        return this.employmentType === 'business';
      },
    },
    revenueTrends: {
      type: [Number], // Array of numbers representing revenue over time
      required: function () {
        return this.employmentType === 'business';
      },
    },
  },

  // Step 5: Family & Education Planning (Optional, defaults to empty array)
  familyDetails: {
    children: [
      {
        age: {
          type: Number,
          min: 0,
        },
        educationGoal: {
          type: String,
          enum: ['local', 'abroad'],
        },
      },
    ],
  },

  // Step 6: Relationship Status (Optional until onboarding)
  relationshipStatus: {
    type: String,
    enum: ['single', 'married', 'divorced'],
  },
  financialPlan: {
    step1: String, // Portfolio risk
    step2: String, // Savings rate
    step3: String, // Tax/liquidity advice
    step4: String, // Business strategies (if applicable)
    step5: String, // Education savings
    step6: String, // Estate planning
    riskProfiling: String, // Risk profile and investment objectives
  },
});

export default mongoose.model('User', userSchema);