import { AuthorModel } from '../models/authorModel.js';
import { isValidUuid, normalizeQuery, sendDatabaseError } from '../utils/httpUtils.js';

const hasText = (value) => typeof value === 'string' && value.trim() !== '';

export const AuthorController = {
  async getAuthors(req, res) {
    try {
      const name = normalizeQuery(req.query.name);
      const authors = await AuthorModel.getAll(name);
      res.json(authors);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getAuthorById(req, res) {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res.status(400).json({ error: 'Format ID author tidak valid.' });
    }

    try {
      const author = await AuthorModel.getById(id);
      if (!author) {
        return res.status(404).json({ error: 'Author tidak ditemukan.' });
      }

      return res.json(author);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async addAuthor(req, res) {
    try {
      const { name, nationality } = req.body;
      
      // Validasi input
      if (!hasText(name) || !hasText(nationality)) {
        return res.status(400).json({ 
          error: 'Nama dan Nasionalitas harus diisi!',
          received: req.body 
        });
      }
      
      const author = await AuthorModel.create(name.trim(), nationality.trim());
      res.status(201).json(author);
    } catch (err) {
      sendDatabaseError(res, err);
    }
  },

  async updateAuthor(req, res) {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res.status(400).json({ error: 'Format ID author tidak valid.' });
    }

    const { name, nationality } = req.body;
    const payload = {};

    if (name !== undefined) {
      if (!hasText(name)) {
        return res.status(400).json({ error: 'Nama author tidak boleh kosong.' });
      }
      payload.name = name.trim();
    }

    if (nationality !== undefined) {
      if (!hasText(nationality)) {
        return res.status(400).json({ error: 'Nasionalitas tidak boleh kosong.' });
      }
      payload.nationality = nationality.trim();
    }

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ error: 'Tidak ada field yang dikirim untuk diupdate.' });
    }

    try {
      const updatedAuthor = await AuthorModel.updateById(id, payload);
      if (!updatedAuthor) {
        return res.status(404).json({ error: 'Author tidak ditemukan.' });
      }

      return res.json(updatedAuthor);
    } catch (err) {
      return sendDatabaseError(res, err);
    }
  },

  async deleteAuthor(req, res) {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res.status(400).json({ error: 'Format ID author tidak valid.' });
    }

    try {
      const deleted = await AuthorModel.deleteById(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Author tidak ditemukan.' });
      }

      return res.json({ message: 'Author berhasil dihapus.' });
    } catch (err) {
      return sendDatabaseError(res, err);
    }
  }
};