import { pool } from '../config/db.js';

export const CategoryModel = {
  async getAll(name = '') {
    if (name) {
      const result = await pool.query(
        'SELECT * FROM categories WHERE name ILIKE $1 ORDER BY name ASC',
        [`%${name}%`]
      );
      return result.rows;
    }

    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async create(name) {
    const query = 'INSERT INTO categories (name) VALUES ($1) RETURNING *';
    const result = await pool.query(query, [name]);
    return result.rows[0];
  },

  async updateById(id, data) {
    const { name } = data;
    const query = `
      UPDATE categories
      SET name = COALESCE($2, name)
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id, name ?? null]);
    return result.rows[0] || null;
  },

  async deleteById(id) {
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
  }
};