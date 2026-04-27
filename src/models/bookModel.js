import { pool } from '../config/db.js';

const parseNonNegativeInteger = (value, fieldName) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${fieldName} harus berupa bilangan bulat >= 0.`);
  }

  return parsed;
};

export const BookModel = {
  // Mengambil semua buku dengan nama penulis dan kategori (JOIN)
  async getAll(title = '') {
    const baseQuery = `
      SELECT b.*, a.name as author_name, c.name as category_name 
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN categories c ON b.category_id = c.id
    `;

    const query = title
      ? `${baseQuery} WHERE b.title ILIKE $1 ORDER BY b.title ASC`
      : `${baseQuery} ORDER BY b.title ASC`;

    const params = title ? [`%${title}%`] : [];
    const result = await pool.query(query, params);
    return result.rows;
  },

  async getById(id) {
    const query = `
      SELECT b.*, a.name as author_name, c.name as category_name 
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  },

  async create(data) {
    const { isbn, title, author_id, category_id, total_copies } = data;
    const parsedTotalCopies = parseNonNegativeInteger(total_copies, 'total_copies');

    const query = `
      INSERT INTO books (isbn, title, author_id, category_id, total_copies, available_copies)
      VALUES ($1, $2, $3, $4, $5, $5) RETURNING *
    `;
    const result = await pool.query(query, [
      isbn,
      title,
      author_id,
      category_id,
      parsedTotalCopies
    ]);
    return result.rows[0];
  },

  async updateById(id, data) {
    const currentResult = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
    if (currentResult.rowCount === 0) {
      return null;
    }

    const current = currentResult.rows[0];
    const merged = {
      isbn: data.isbn ?? current.isbn,
      title: data.title ?? current.title,
      author_id: data.author_id ?? current.author_id,
      category_id: data.category_id ?? current.category_id,
      total_copies: data.total_copies ?? current.total_copies,
      available_copies: data.available_copies ?? current.available_copies
    };

    const parsedTotalCopies = parseNonNegativeInteger(merged.total_copies, 'total_copies');
    const parsedAvailableCopies = parseNonNegativeInteger(
      merged.available_copies,
      'available_copies'
    );

    if (parsedAvailableCopies > parsedTotalCopies) {
      throw new Error('available_copies tidak boleh melebihi total_copies.');
    }

    const query = `
      UPDATE books
      SET
        isbn = $2,
        title = $3,
        author_id = $4,
        category_id = $5,
        total_copies = $6,
        available_copies = $7
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [
      id,
      merged.isbn,
      merged.title,
      merged.author_id,
      merged.category_id,
      parsedTotalCopies,
      parsedAvailableCopies
    ]);

    return result.rows[0] || null;
  },

  async deleteById(id) {
    const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
  }
};