import { pool } from '../config/db.js';

export const LoanModel = {
  async createLoan(book_id, member_id, due_date) {
    const client = await pool.connect(); // Menggunakan client untuk transaksi
    try {
      await client.query('BEGIN'); // Mulai transaksi database

      // 1. Cek ketersediaan buku
      const bookCheck = await client.query(
        'SELECT available_copies FROM books WHERE id = $1 FOR UPDATE',
        [book_id]
      );
      if (bookCheck.rowCount === 0) {
        throw new Error('Buku tidak ditemukan.');
      }

      const memberCheck = await client.query('SELECT id FROM members WHERE id = $1', [member_id]);
      if (memberCheck.rowCount === 0) {
        throw new Error('Member tidak ditemukan.');
      }

      if (bookCheck.rows[0].available_copies <= 0) {
        throw new Error('Buku sedang tidak tersedia (stok habis).');
      }

      // 2. Kurangi stok buku
      await client.query('UPDATE books SET available_copies = available_copies - 1 WHERE id = $1', [book_id]);

      // 3. Catat transaksi peminjaman
      const loanQuery = `
        INSERT INTO loans (book_id, member_id, due_date, status) 
        VALUES ($1, $2, $3, 'BORROWED') RETURNING *
      `;
      const result = await client.query(loanQuery, [book_id, member_id, due_date]);

      await client.query('COMMIT'); // Simpan semua perubahan
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK'); // Batalkan jika ada error
      throw error;
    } finally {
      client.release();
    }
  },

  async getAllLoans() {
    const query = `
      SELECT l.*, b.title as book_title, m.full_name as member_name 
      FROM loans l
      JOIN books b ON l.book_id = b.id
      JOIN members m ON l.member_id = m.id
      ORDER BY l.loan_date DESC NULLS LAST, l.due_date ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  async returnLoan(loan_id) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const loanCheck = await client.query(
        `
          SELECT l.id, l.book_id, l.status, b.available_copies, b.total_copies
          FROM loans l
          JOIN books b ON b.id = l.book_id
          WHERE l.id = $1
          FOR UPDATE
        `,
        [loan_id]
      );

      if (loanCheck.rowCount === 0) {
        throw new Error('Data peminjaman tidak ditemukan.');
      }

      const currentLoan = loanCheck.rows[0];

      if (currentLoan.status !== 'BORROWED') {
        throw new Error('Hanya peminjaman berstatus BORROWED yang dapat dikembalikan.');
      }

      const updatedBook = await client.query(
        `
          UPDATE books
          SET available_copies = available_copies + 1
          WHERE id = $1 AND available_copies < total_copies
          RETURNING id, available_copies, total_copies
        `,
        [currentLoan.book_id]
      );

      if (updatedBook.rowCount === 0) {
        throw new Error('Gagal memperbarui stok buku saat proses pengembalian.');
      }

      const updatedLoan = await client.query(
        `
          UPDATE loans
          SET status = 'RETURNED', return_date = CURRENT_DATE
          WHERE id = $1
          RETURNING *
        `,
        [loan_id]
      );

      await client.query('COMMIT');

      return {
        loan: updatedLoan.rows[0],
        book: updatedBook.rows[0]
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};
