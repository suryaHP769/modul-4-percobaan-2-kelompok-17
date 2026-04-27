import { LoanModel } from '../models/loanModel.js';
import { isValidUuid, sendDatabaseError } from '../utils/httpUtils.js';

const hasText = (value) => typeof value === 'string' && value.trim() !== '';

export const LoanController = {
  async createLoan(req, res) {
    const { book_id, member_id, due_date } = req.body;
    
    // Validasi input
    if (!book_id || !member_id || !due_date) {
      return res.status(400).json({ 
        error: 'Semua field harus diisi: book_id, member_id, due_date',
        received: req.body
      });
    }

    if (!isValidUuid(book_id) || !isValidUuid(member_id)) {
      return res.status(400).json({ error: 'book_id dan member_id harus UUID yang valid.' });
    }

    if (!hasText(due_date)) {
      return res.status(400).json({ error: 'due_date wajib diisi.' });
    }
    
    try {
      const loan = await LoanModel.createLoan(book_id, member_id, due_date);
      res.status(201).json({
        message: "Peminjaman berhasil dicatat!",
        data: loan
      });
    } catch (err) {
      sendDatabaseError(res, err);
    }
  },

  async getLoans(req, res) {
    try {
      const loans = await LoanModel.getAllLoans();
      res.json(loans);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async returnLoan(req, res) {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res.status(400).json({ error: 'Format ID peminjaman tidak valid.' });
    }

    try {
      const result = await LoanModel.returnLoan(id);
      return res.json({
        message: 'Pengembalian buku berhasil diproses.',
        data: result
      });
    } catch (err) {
      if (err.message === 'Data peminjaman tidak ditemukan.') {
        return res.status(404).json({ error: err.message });
      }

      if (err.message.includes('BORROWED') || err.message.includes('stok')) {
        return res.status(400).json({ error: err.message });
      }

      return sendDatabaseError(res, err);
    }
  }
};
