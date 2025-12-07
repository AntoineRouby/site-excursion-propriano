import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User.model';
import { sendEmail } from './email.service';
import { SMSService } from './sms.service';

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

  async register(userData: any) {
    const { email, password, firstName, lastName, phone } = userData;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      verificationToken: crypto.randomBytes(32).toString('hex'),
    });

    await user.save();

    // Send verification email
    await sendEmail({
      to: email,
      subject: 'Bienvenue chez Écho des Vagues',
      template: 'welcome',
      data: {
        firstName,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email/${user.verificationToken}`,
      },
    });

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        isVerified: user.isVerified,
      },
    };
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new Error('Please verify your email');
    }

    const token = jwt.sign({ userId: user._id }, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        isVerified: user.isVerified,
        role: user.role,
      },
    };
  }

  async socialLogin(provider: string, accessToken: string) {
    // Verify social token with provider
    let socialData;
    switch (provider) {
      case 'google':
        socialData = await this.verifyGoogleToken(accessToken);
        break;
      case 'facebook':
        socialData = await this.verifyFacebookToken(accessToken);
        break;
      default:
        throw new Error('Unsupported provider');
    }

    // Find or create user
    let user = await User.findOne({ email: socialData.email });
    
    if (!user) {
      user = new User({
        email: socialData.email,
        firstName: socialData.firstName,
        lastName: socialData.lastName,
        isVerified: true,
        provider,
        providerId: socialData.id,
      });
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        isVerified: user.isVerified,
        role: user.role,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    await sendEmail({
      to: email,
      subject: 'Réinitialisation de mot de passe',
      template: 'password-reset',
      data: {
        firstName: user.firstName,
        resetUrl: `${process.env.FRONTEND_URL}/reset-password/${resetToken}`,
      },
    });

    return { message: 'Password reset email sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password reset successful' };
  }

  private async verifyGoogleToken(accessToken: string) {
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    const ticket = await client.verifyIdToken({
      idToken: accessToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    return {
      id: payload.sub,
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
    };
  }

  private async verifyFacebookToken(accessToken: string) {
    const axios = require('axios');
    const response = await axios.get(`https://graph.facebook.com/me`, {
      params: {
        access_token: accessToken,
        fields: 'id,email,first_name,last_name',
      },
    });
    
    return {
      id: response.data.id,
      email: response.data.email,
      firstName: response.data.first_name,
      lastName: response.data.last_name,
    };
  }
}

export const authService = new AuthService();