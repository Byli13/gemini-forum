const db = require('../config/database');

class TopicModel {
  static async findById(id) {
    const result = await db.query(
      `SELECT t.*, u.username as author_username, u.avatar_url as author_avatar,
              f.name as forum_name, f.slug as forum_slug,
              c.name as category_name, c.slug as category_slug,
              COUNT(DISTINCT p.id) as post_count
       FROM topics t
       LEFT JOIN users u ON u.id = t.user_id
       LEFT JOIN forums f ON f.id = t.forum_id
       LEFT JOIN categories c ON c.id = f.category_id
       LEFT JOIN posts p ON p.topic_id = t.id
       WHERE t.id = $1
       GROUP BY t.id, u.username, u.avatar_url, f.name, f.slug, c.name, c.slug`,
      [id]
    );
    return result.rows[0];
  }
  
  static async findBySlug(forumId, slug) {
    const result = await db.query(
      `SELECT t.*, u.username as author_username, u.avatar_url as author_avatar
       FROM topics t
       LEFT JOIN users u ON u.id = t.user_id
       WHERE t.forum_id = $1 AND t.slug = $2`,
      [forumId, slug]
    );
    return result.rows[0];
  }
  
  static async listByForum(forumId, offset = 0, limit = 20) {
    const result = await db.query(
      `SELECT t.*, u.username as author_username, u.avatar_url as author_avatar,
              COUNT(DISTINCT p.id) as post_count,
              MAX(p.created_at) as last_post_at
       FROM topics t
       LEFT JOIN users u ON u.id = t.user_id
       LEFT JOIN posts p ON p.topic_id = t.id
       WHERE t.forum_id = $1
       GROUP BY t.id, u.username, u.avatar_url
       ORDER BY t.is_pinned DESC, last_post_at DESC NULLS LAST
       LIMIT $2 OFFSET $3`,
      [forumId, limit, offset]
    );
    return result.rows;
  }
  
  static async create(data) {
    const { forumId, userId, title, slug } = data;
    const result = await db.query(
      'INSERT INTO topics (forum_id, user_id, title, slug) VALUES ($1, $2, $3, $4) RETURNING *',
      [forumId, userId, title, slug]
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
      `UPDATE topics SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }
  
  static async incrementViewCount(id) {
    await db.query(
      'UPDATE topics SET view_count = view_count + 1 WHERE id = $1',
      [id]
    );
  }
  
  static async delete(id) {
    await db.query('DELETE FROM topics WHERE id = $1', [id]);
  }
  
  static async countByForum(forumId) {
    const result = await db.query(
      'SELECT COUNT(*) FROM topics WHERE forum_id = $1',
      [forumId]
    );
    return parseInt(result.rows[0].count);
  }
}

module.exports = TopicModel;
