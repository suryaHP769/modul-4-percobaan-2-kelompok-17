import { MemberModel } from '../models/memberModel.js';

export const MemberController = {
  // Mendapatkan semua daftar anggota
  async getAllMembers(req, res) {
    try {
      const members = await MemberModel.getAll();
      res.json(members);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Mendaftarkan anggota baru
  async registerMember(req, res) {
    try {
      const { full_name, email, member_type } = req.body;
      
      // Validasi input
      if (!full_name || !email || !member_type) {
        return res.status(400).json({ 
          error: 'Semua field harus diisi: full_name, email, member_type',
          received: req.body
        });
      }
      
      const newMember = await MemberModel.create(req.body);
      res.status(201).json({
        message: "Anggota berhasil didaftarkan!",
        data: newMember
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};