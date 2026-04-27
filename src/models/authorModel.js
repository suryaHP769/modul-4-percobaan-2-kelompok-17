import { pool } from '../config/db.js';

export const AuthorModel = {
  async getAll(name = '') {
    if (name) {
      const result = await pool.query(
        'SELECT * FROM authors WHERE name ILIKE $1 ORDER BY name ASC',
        [`%${name}%`]
      );
      return result.rows;
    }

    const result = await pool.query('SELECT * FROM authors ORDER BY name ASC');
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query('SELECT * FROM authors WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async create(name, nationality) {
    const query = 'INSERT INTO authors (name, nationality) VALUES ($1, $2) RETURNING *';
    const result = await pool.query(query, [name, nationality]);
    return result.rows[0];
  },

  async updateById(id, data) {
    const { name, nationality } = data;
    const query = `
      UPDATE authors
      SET
        name = COALESCE($2, name),
        nationality = COALESCE($3, nationality)
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id, name ?? null, nationality ?? null]);
    return result.rows[0] || null;
  },

  async deleteById(id) {
    const result = await pool.query('DELETE FROM authors WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
  }
};