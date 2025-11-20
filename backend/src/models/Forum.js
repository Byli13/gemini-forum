const db = require('../config/database');

class ForumModel {
  static async findAll() {
    const result = await db.query(
      `SELECT c.id as category_id, c.name as category_name, c.slug as category_slug,
              f.id as forum_id, f.name as forum_name, f.slug as forum_slug, 
              f.description as forum_description,
              COUNT(DISTINCT t.id) as topic_count,
              COUNT(DISTINCT p.id) as post_count
       FROM categories c
       LEFT JOIN forums f ON f.category_id = c.id
       LEFT JOIN topics t ON t.forum_id = f.id
       LEFT JOIN posts p ON p.topic_id = t.id
       GROUP BY c.id, c.name, c.slug, c.display_order, f.id, f.name, f.slug, f.description, f.display_order
       ORDER BY c.display_order, f.display_order`
    );
    
    const categories = {};
    result.rows.forEach(row => {
      if (!categories[row.category_id]) {
        categories[row.category_id] = {
          id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
          forums: []
        };
      }
      
      if (row.forum_id) {
        categories[row.category_id].forums.push({
          id: row.forum_id,
          name: row.forum_name,
          slug: row.forum_slug,
          description: row.forum_description,
          topicCount: parseInt(row.topic_count),
          postCount: parseInt(row.post_count)
        });
      }
    });
    
    return Object.values(categories);
  }
  
  static async findBySlug(categorySlug, forumSlug) {
    const result = await db.query(
      `SELECT f.*, c.name as category_name, c.slug as category_slug
       FROM forums f
       JOIN categories c ON c.id = f.category_id
       WHERE c.slug = $1 AND f.slug = $2`,
      [categorySlug, forumSlug]
    );
    return result.rows[0];
  }
  
  static async createCategory(data) {
    const { name, description, slug } = data;
    const result = await db.query(
      'INSERT INTO categories (name, description, slug) VALUES ($1, $2, $3) RETURNING *',
      [name, description, slug]
    );
    return result.rows[0];
  }
  
  static async createForum(data) {
    const { categoryId, name, description, slug } = data;
    const result = await db.query(
      'INSERT INTO forums (category_id, name, description, slug) VALUES ($1, $2, $3, $4) RETURNING *',
      [categoryId, name, description, slug]
    );
    return result.rows[0];
  }
}

module.exports = ForumModel;
