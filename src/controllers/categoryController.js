import { CategoryModel } from '../models/categoryModel.js';

export const CategoryController = {
  async getCategories(req, res) {
    try {
      const categories = await CategoryModel.getAll();
      res.json(categories);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async addCategory(req, res) {
    try {
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ 
          error: 'Nama kategori harus diisi!' 
        });
      }
      
      const category = await CategoryModel.create(name);
      res.status(201).json(category);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};