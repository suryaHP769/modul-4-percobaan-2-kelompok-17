import { BookModel } from '../models/bookModel.js';

export const BookController = {
  async getAllBooks(req, res) {
    try {
      const books = await BookModel.getAll();
      res.json(books);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async createBook(req, res) {
    try {
      const { isbn, title, author_id, category_id, total_copies } = req.body;
      
      // Validasi input
      if (!isbn || !title || !author_id || !category_id || !total_copies) {
        return res.status(400).json({ 
          error: 'Semua field harus diisi: isbn, title, author_id, category_id, total_copies',
          received: req.body
        });
      }
      
      const newBook = await BookModel.create(req.body);
      res.status(201).json(newBook);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};
