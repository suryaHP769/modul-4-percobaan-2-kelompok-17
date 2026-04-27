import { CategoryModel } from '../models/categoryModel.js';
import { isValidUuid, normalizeQuery, sendDatabaseError } from '../utils/httpUtils.js';

const hasText = (value) => typeof value === 'string' && value.trim() !== '';

export const CategoryController = {
  async getCategories(req, res) {
    try {
      const name = normalizeQuery(req.query.name);
      const categories = await CategoryModel.getAll(name);
      res.json(categories);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getCategoryById(req, res) {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res.status(400).json({ error: 'Format ID kategori tidak valid.' });
    }

    try {
      const category = await CategoryModel.getById(id);
      if (!category) {
        return res.status(404).json({ error: 'Kategori tidak ditemukan.' });
      }

      return res.json(category);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async addCategory(req, res) {
    try {
      const { name } = req.body;
      
      if (!hasText(name)) {
        return res.status(400).json({ 
          error: 'Nama kategori harus diisi!' 
        });
      }
      
      const category = await CategoryModel.create(name.trim());
      res.status(201).json(category);
    } catch (err) {
      sendDatabaseError(res, err);
    }
  },

  async updateCategory(req, res) {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res.status(400).json({ error: 'Format ID kategori tidak valid.' });
    }

    const { name } = req.body;
    if (name === undefined) {
      return res.status(400).json({ error: 'Tidak ada field yang dikirim untuk diupdate.' });
    }

    if (!hasText(name)) {
      return res.status(400).json({ error: 'Nama kategori tidak boleh kosong.' });
    }

    try {
      const updatedCategory = await CategoryModel.updateById(id, { name: name.trim() });
      if (!updatedCategory) {
        return res.status(404).json({ error: 'Kategori tidak ditemukan.' });
      }

      return res.json(updatedCategory);
    } catch (err) {
      return sendDatabaseError(res, err);
    }
  },

  async deleteCategory(req, res) {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res.status(400).json({ error: 'Format ID kategori tidak valid.' });
    }

    try {
      const deleted = await CategoryModel.deleteById(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Kategori tidak ditemukan.' });
      }

      return res.json({ message: 'Kategori berhasil dihapus.' });
    } catch (err) {
      return sendDatabaseError(res, err);
    }
  }
};