import { LoanModel } from '../models/loanModel.js';

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
    
    try {
      const loan = await LoanModel.createLoan(book_id, member_id, due_date);
      res.status(201).json({
        message: "Peminjaman berhasil dicatat!",
        data: loan
      });
    } catch (err) {
      // Jika stok habis atau ID salah, kirim status 400 (Bad Request)
      res.status(400).json({ error: err.message });
    }
  },

  async getLoans(req, res) {
    try {
      const loans = await LoanModel.getAllLoans();
      res.json(loans);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
