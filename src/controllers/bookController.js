import { BookModel } from '../models/bookModel.js';
import { isValidUuid, normalizeQuery, sendDatabaseError } from '../utils/httpUtils.js';

const hasText = (value) => typeof value === 'string' && value.trim() !== '';

const isNonNegativeInteger = (value) => Number.isInteger(Number(value)) && Number(value) >= 0;

export const BookController = {
  async getAllBooks(req, res) {
    try {
      const title = normalizeQuery(req.query.title);
      const books = await BookModel.getAll(title);
      res.json(books);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getBookById(req, res) {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res.status(400).json({ error: 'Format ID buku tidak valid.' });
    }

    try {
      const book = await BookModel.getById(id);
      if (!book) {
        return res.status(404).json({ error: 'Buku tidak ditemukan.' });
      }

      return res.json(book);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async createBook(req, res) {
    try {
      const { isbn, title, author_id, category_id, total_copies } = req.body;
      
      // Validasi input
      if (
        !hasText(isbn) ||
        !hasText(title) ||
        !author_id ||
        !category_id ||
        total_copies === undefined
      ) {
        return res.status(400).json({ 
          error: 'Semua field harus diisi: isbn, title, author_id, category_id, total_copies',
          received: req.body
        });
      }

      if (!isValidUuid(author_id) || !isValidUuid(category_id)) {
        return res.status(400).json({ error: 'author_id dan category_id harus UUID yang valid.' });
      }

      if (!isNonNegativeInteger(total_copies)) {
        return res.status(400).json({ error: 'total_copies harus bilangan bulat >= 0.' });
      }
      
      const newBook = await BookModel.create({
        isbn: isbn.trim(),
        title: title.trim(),
        author_id,
        category_id,
        total_copies: Number(total_copies)
      });
      res.status(201).json(newBook);
    } catch (err) {
      sendDatabaseError(res, err);
    }
  },

  async updateBook(req, res) {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res.status(400).json({ error: 'Format ID buku tidak valid.' });
    }

    const { isbn, title, author_id, category_id, total_copies, available_copies } = req.body;
    const payload = {};

    if (isbn !== undefined) {
      if (!hasText(isbn)) {
        return res.status(400).json({ error: 'isbn tidak boleh kosong.' });
      }
      payload.isbn = isbn.trim();
    }

    if (title !== undefined) {
      if (!hasText(title)) {
        return res.status(400).json({ error: 'title tidak boleh kosong.' });
      }
      payload.title = title.trim();
    }

    if (author_id !== undefined) {
      if (!isValidUuid(author_id)) {
        return res.status(400).json({ error: 'author_id harus UUID yang valid.' });
      }
      payload.author_id = author_id;
    }

    if (category_id !== undefined) {
      if (!isValidUuid(category_id)) {
        return res.status(400).json({ error: 'category_id harus UUID yang valid.' });
      }
      payload.category_id = category_id;
    }

    if (total_copies !== undefined) {
      if (!isNonNegativeInteger(total_copies)) {
        return res.status(400).json({ error: 'total_copies harus bilangan bulat >= 0.' });
      }
      payload.total_copies = Number(total_copies);
    }

    if (available_copies !== undefined) {
      if (!isNonNegativeInteger(available_copies)) {
        return res.status(400).json({ error: 'available_copies harus bilangan bulat >= 0.' });
      }
      payload.available_copies = Number(available_copies);
    }

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ error: 'Tidak ada field yang dikirim untuk diupdate.' });
    }

    try {
      const updatedBook = await BookModel.updateById(id, payload);
      if (!updatedBook) {
        return res.status(404).json({ error: 'Buku tidak ditemukan.' });
      }

      return res.json(updatedBook);
    } catch (err) {
      return sendDatabaseError(res, err);
    }
  },

  async deleteBook(req, res) {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res.status(400).json({ error: 'Format ID buku tidak valid.' });
    }

    try {
      const deleted = await BookModel.deleteById(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Buku tidak ditemukan.' });
      }

      return res.json({ message: 'Buku berhasil dihapus dari sistem.' });
    } catch (err) {
      return sendDatabaseError(res, err);
    }
  }
};
