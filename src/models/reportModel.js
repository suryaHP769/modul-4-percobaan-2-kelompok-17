import { pool } from '../config/db.js';

export const ReportModel = {
  async getLibraryStats() {
    const query = `
      SELECT
        (SELECT COUNT(*)::int FROM books) AS total_books,
        (SELECT COUNT(*)::int FROM authors) AS total_authors,
        (SELECT COUNT(*)::int FROM categories) AS total_categories,
        (
          SELECT COUNT(*)::int
          FROM loans
          WHERE status = 'BORROWED'
        ) AS total_borrowed_loans
    `;

    const result = await pool.query(query);
    return result.rows[0];
  }
};
