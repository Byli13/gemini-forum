const db = require('../config/database');

class PostModel {
  static async findById(id) {
    const result = await db.query(
      `SELECT p.*, u.username as author_username, u.avatar_url as author_avatar, u.role as author_role,
              (SELECT COUNT(*) FROM reactions WHERE post_id = p.id) as reaction_count
       FROM posts p
       LEFT JOIN users u ON u.id = p.user_id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0];
  }
  
  static async listByTopic(topicId, offset = 0, limit = 20) {
    const result = await db.query(
      `SELECT p.*, u.username as author_username, u.avatar_url as author_avatar, u.role as author_role,
              (SELECT COUNT(*) FROM reactions WHERE post_id = p.id) as reaction_count
       FROM posts p
       LEFT JOIN users u ON u.id = p.user_id
       WHERE p.topic_id = $1
       ORDER BY p.created_at ASC
       LIMIT $2 OFFSET $3`,
      [topicId, limit, offset]
    );
    return result.rows;
  }
  
  static async create(data) {
    const { topicId, userId, content } = data;
    const result = await db.query(
      'INSERT INTO posts (topic_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [topicId, userId, content]
    );
    return result.rows[0];
  }
  
  static async update(id, content) {
    const result = await db.query(
      'UPDATE posts SET content = $1, is_edited = true, edited_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [content, id]
    );
    return result.rows[0];
  }
  
  static async delete(id) {
    await db.query('DELETE FROM posts WHERE id = $1', [id]);
  }
  
  static async countByTopic(topicId) {
    const result = await db.query(
      'SELECT COUNT(*) FROM posts WHERE topic_id = $1',
      [topicId]
    );
    return parseInt(result.rows[0].count);
  }
  
  static async addReaction(postId, userId, reactionType = 'like') {
    const result = await db.query(
      'INSERT INTO reactions (post_id, user_id, reaction_type) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING *',
      [postId, userId, reactionType]
    );
    return result.rows[0];
  }
  
  static async removeReaction(postId, userId, reactionType = 'like') {
    await db.query(
      'DELETE FROM reactions WHERE post_id = $1 AND user_id = $2 AND reaction_type = $3',
      [postId, userId, reactionType]
    );
  }
}

module.exports = PostModel;
