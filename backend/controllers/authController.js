import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import generateOTP from '../utils/generateOTP.js';
import sendEmail from '../utils/sendEmail.js';
import callOpenRouter from '../utils/aiService.js';

// Signup: Initiate signup and send OTP
const signup = async (request, reply) => {
  const { username, email, password } = request.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return reply.code(400).send({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    const user = new User({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
      otp,
      otpExpiry
    });

    await user.save();

    // Send verification email with OTP
    const emailSubject = 'Verify Your Email Address';
    const emailText = `Dear ${username},\n\nThank you for signing up. Your verification code is ${otp}. This code will expire in 10 minutes.\n\nBest regards,\nSynai Team`;
    const emailHtml = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            h1 { color: #4CAF50; }
            .code { 
              font-size: 24px; 
              font-weight: bold;
              text-align: center; 
              color: #4CAF50;
              margin: 20px 0;
              padding: 10px;
              background: #f0f0f0;
              border-radius: 5px;
            }
            .footer { margin-top: 20px; font-size: 12px; color: #777; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Verify Your Email Address</h1>
            <p>Dear ${username},</p>
            <p>Thank you for signing up with Synai. Please use the following verification code:</p>
            <div class="code">${otp}</div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <div class="footer">
              <p>Best regards,<br>The Synai Team</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail(email, emailSubject, emailText, emailHtml);

    reply.send({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Signup Error:', error);
    reply.code(500).send({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verify OTP: Confirm OTP and activate account
const verifyOTP = async (request, reply) => {
  const { email, otp } = request.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return reply.code(400).send({ message: 'User not found' });
    }

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return reply.code(400).send({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    reply.send({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('OTP Verification Error:', error);
    reply.code(500).send({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const resendOTP = async (request, reply) => {
  const { email } = request.body;

  try {
    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return reply.code(404).send({ message: 'User not found' });
    }

    // 2. Generate new OTP and set expiry
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // 3. Update user record
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // 4. Define email content
    const emailSubject = 'Verify Your Email Address';
    const emailText = `Dear User,\n\nThank you for using our service. Your new verification code is ${otp}. This code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.\n\nBest regards,\nSynai Team`;
    const emailHtml = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            h1 { color: #4CAF50; }
            .code { 
              font-size: 24px; 
              font-weight: bold;
              text-align: center; 
              color: #4CAF50;
              margin: 20px 0;
              padding: 10px;
              background: #f0f0f0;
              border-radius: 5px;
            }
            .footer { margin-top: 20px; font-size: 12px; color: #777; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Verify Your Email Address</h1>
            <p>Dear User,</p>
            <p>Thank you for using Synai. Please use the following verification code:</p>
            <div class="code">${otp}</div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <div class="footer">
              <p>Best regards,<br>The Synai Team</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // 5. Send email with both text and HTML content
    await sendEmail(email, emailSubject, emailText, emailHtml);

    // 6. Return success response
    return reply.send({ 
      message: 'New OTP sent to your email',
      success: true
    });

  } catch (error) {
    console.error('OTP Resend Error:', error);
    return reply.code(500).send({ 
      message: 'Failed to resend OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login: Authenticate user and return JWT
const login = async (request, reply) => {
  const { email, password } = request.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.isVerified) {
      return reply.code(400).send({ message: 'Invalid credentials or email not verified' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.code(400).send({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
    reply.send({ token });
  } catch (error) {
    console.error('Login Error:', error);
    reply.code(500).send({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get Profile: Sample protected route
const getProfile = async (request, reply) => {
  try {
    const user = await User.findById(request.userId).select('-password -otp -otpExpiry');
    if (!user) {
      return reply.code(404).send({ message: 'User not found' });
    }
    reply.send(user);
  } catch (error) {
    console.error('Get Profile Error:', error);
    reply.code(500).send({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const onboarding = async (request, reply) => {
  const userId = request.userId;
  const onboardingData = request.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return reply.code(404).send({ message: 'User not found' });
    }

    // Update user with onboarding data
    user.age = onboardingData.age;
    user.retirementAge = onboardingData.retirementAge;
    user.monthlyIncome = onboardingData.monthlyIncome;
    user.averageExpenses = onboardingData.averageExpenses;
    user.employmentType = onboardingData.employmentType;
    user.relationshipStatus = onboardingData.relationshipStatus;

    // Handle business details (required only for entrepreneurs)
    if (onboardingData.employmentType === 'business') {
      if (!onboardingData.businessDetails) {
        return reply.code(400).send({ message: 'Business details are required for business owners' });
      }
      user.businessDetails = onboardingData.businessDetails;
    } else {
      user.businessDetails = undefined; // Clear if not applicable
    }

    // Handle family details (optional)
    user.familyDetails = onboardingData.familyDetails || { children: [] };

    await user.save();

    reply.send({ message: 'Onboarding completed successfully' });
  } catch (error) {
    console.error('Onboarding Error:', error);
    reply.code(500).send({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const generateFinancialPlan = async (request, reply) => {
  try {
    const user = await User.findById(request.userId);
    if (!user) {
      return reply.code(404).send({ message: 'User not found' });
    }

    // Prepare prompts for each step
    const prompts = {
      step1: `User is ${user.age} years old and wants to retire at ${user.retirementAge}. Suggest a portfolio risk level (low, medium, high) and explain why.`,
      step2: `User has monthly income of $${user.monthlyIncome} and average expenses of $${user.averageExpenses}. Recommend a savings rate and explain.`,
      step3: `User is a ${user.employmentType}. Suggest tax strategies and liquidity advice tailored to this employment type.`,
      step4: user.employmentType === 'business'
        ? `User has an equity/debt ratio of ${user.businessDetails?.equityDebtRatio} and revenue trends of ${user.businessDetails?.revenueTrends}. Recommend debt management and growth strategies.`
        : null,
      step5: `User has ${user.familyDetails?.children.length || 0} children with education goals: ${user.familyDetails?.children.map(c => c.educationGoal).join(', ')}. Estimate education costs and suggest a savings plan.`,
      step6: `User's relationship status is ${user.relationshipStatus}. Adjust estate planning and beneficiary logic accordingly.`,
      riskProfiling: `User is ${user.age} years old, has $${user.monthlyIncome} income, $${user.averageExpenses} expenses, ${user.familyDetails?.children.length || 0} children, and is ${user.relationshipStatus}. Suggest a risk profile (conservative, moderate, aggressive) and investment objectives (retirement, education, wealth).`,
    };

    // Call DeepSeek for each step
    const results = {};
    for (const [step, prompt] of Object.entries(prompts)) {
      if (prompt) {
        results[step] = await callOpenRouter(prompt);
      }
    }

    // Save results to user document
    user.financialPlan = results;
    await user.save();

    reply.send({
      message: 'Financial plan generated successfully',
      plan: results,
    });
  } catch (error) {
    console.error('Financial Plan Error:', error);
    reply.code(500).send({ 
      message: 'Failed to generate financial plan', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// Add to your existing auth controller

// Logout (optional - for token blacklisting if needed)
const logout = async (request, reply) => {
  // In JWT, logout is typically client-side (token deletion)
  // But you might want to maintain a blacklist for security
  reply.send({ message: 'Logged out successfully' });
};

// Change Password
const changePassword = async (request, reply) => {
  const { currentPassword, newPassword } = request.body;
  const userId = request.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return reply.code(404).send({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return reply.code(400).send({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    reply.send({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change Password Error:', error);
    reply.code(500).send({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Forgot Password
const forgotPassword = async (request, reply) => {
  const { email } = request.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether email exists for security
      return reply.send({ message: 'If email exists, reset instructions sent' });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { 
      expiresIn: '1h' 
    });
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const emailSubject = 'Password Reset Request';
    const emailHtml = `
      <div>
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
      </div>
    `;

    await sendEmail(email, emailSubject, '', emailHtml);
    reply.send({ message: 'If email exists, reset instructions sent' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    reply.code(500).send({ message: 'Server error' });
  }
};

// Reset Password
const resetPassword = async (request, reply) => {
  const { token, newPassword } = request.body;

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return reply.code(400).send({ message: 'Invalid or expired reset token' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    reply.send({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    reply.code(500).send({ message: 'Invalid or expired reset token' });
  }
};

// Update Profile
const updateProfile = async (request, reply) => {
  const userId = request.userId;
  const updateData = request.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId, 
      { $set: updateData }, 
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpiry');

    if (!user) {
      return reply.code(404).send({ message: 'User not found' });
    }

    reply.send({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update Profile Error:', error);
    reply.code(500).send({ message: 'Server error' });
  }
};

export { signup, verifyOTP, login, getProfile, updateProfile, changePassword, resetPassword, forgotPassword, resendOTP, onboarding, generateFinancialPlan };