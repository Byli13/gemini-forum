const db = require('../config/database');

class UserModel {
  static async findById(id) {
    const result = await db.query(
      'SELECT id, username, email, role, is_active, avatar_url, bio, created_at, last_login FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }
  
  static async findByUsername(username) {
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0];
  }
  
  static async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }
  
  static async create(userData) {
    const { username, email, passwordHash, role = 'user' } = userData;
    const result = await db.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
      [username, email, passwordHash, role]
    );
    return result.rows[0];
  }
  
  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });
    
    if (fields.length === 0) return null;
    
    values.push(id);
    const result = await db.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING id, username, email, role, avatar_url, bio, updated_at`,
      values
    );
    return result.rows[0];
  }
  
  static async updateLastLogin(id) {
    await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  }
  
  static async list(offset = 0, limit = 20) {
    const result = await db.query(
      'SELECT id, username, email, role, is_active, avatar_url, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }
  
  static async count() {
    const result = await db.query('SELECT COUNT(*) FROM users');
    return parseInt(result.rows[0].count);
  }
  
  static async setActive(id, isActive) {
    await db.query(
      'UPDATE users SET is_active = $1 WHERE id = $2',
      [isActive, id]
    );
  }
}

module.exports = UserModel;
