const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');
const config = require('../config');

class AuthService {
  static async register(username, email, password) {
    // Check if user already exists
    const existingUser = await UserModel.findByUsername(username);
    if (existingUser) {
      throw new Error('Username already taken');
    }
    
    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) {
      throw new Error('Email already registered');
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, config.bcrypt.rounds);
    
    // Create user
    const user = await UserModel.create({
      username,
      email,
      passwordHash,
    });
    
    // Generate token
    const token = this.generateToken(user);
    
    return { user, token };
  }
  
  static async login(usernameOrEmail, password) {
    // Find user by username or email
    let user = await UserModel.findByUsername(usernameOrEmail);
    if (!user) {
      user = await UserModel.findByEmail(usernameOrEmail);
    }
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    if (!user.is_active) {
      throw new Error('Account is disabled');
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }
    
    // Update last login
    await UserModel.updateLastLogin(user.id);
    
    // Generate token
    const token = this.generateToken(user);
    
    // Remove password hash from response
    delete user.password_hash;
    
    return { user, token };
  }
  
  static generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }
  
  static async changePassword(userId, oldPassword, newPassword) {
    const user = await UserModel.findByUsername((await UserModel.findById(userId)).username);
    
    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid current password');
    }
    
    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, config.bcrypt.rounds);
    
    // Update password
    await UserModel.update(userId, { password_hash: passwordHash });
  }
}

module.exports = AuthService;
