require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    }
  },
  
  redis: {
    url: process.env.REDIS_URL,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
  
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
};
