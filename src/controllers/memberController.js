import { MemberModel } from '../models/memberModel.js';
import { isValidUuid, sendDatabaseError } from '../utils/httpUtils.js';

const hasText = (value) => typeof value === 'string' && value.trim() !== '';
const ALLOWED_MEMBER_TYPES = new Set(['STUDENT', 'FACULTY', 'STAFF']);

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

  async getMemberById(req, res) {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res.status(400).json({ error: 'Format ID member tidak valid.' });
    }

    try {
      const member = await MemberModel.getById(id);
      if (!member) {
        return res.status(404).json({ error: 'Member tidak ditemukan.' });
      }

      return res.json(member);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Mendaftarkan anggota baru
  async registerMember(req, res) {
    try {
      const { full_name, email, member_type } = req.body;
      
      // Validasi input
      if (!hasText(full_name) || !hasText(email) || !hasText(member_type)) {
        return res.status(400).json({ 
          error: 'Semua field harus diisi: full_name, email, member_type',
          received: req.body
        });
      }

      if (!ALLOWED_MEMBER_TYPES.has(member_type.trim().toUpperCase())) {
        return res.status(400).json({
          error: 'member_type hanya boleh STUDENT, FACULTY, atau STAFF.'
        });
      }
      
      const newMember = await MemberModel.create({
        full_name: full_name.trim(),
        email: email.trim(),
        member_type: member_type.trim().toUpperCase()
      });
      res.status(201).json({
        message: "Anggota berhasil didaftarkan!",
        data: newMember
      });
    } catch (err) {
      sendDatabaseError(res, err);
    }
  },

  async updateMember(req, res) {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res.status(400).json({ error: 'Format ID member tidak valid.' });
    }

    const { full_name, email, member_type } = req.body;
    const payload = {};

    if (full_name !== undefined) {
      if (!hasText(full_name)) {
        return res.status(400).json({ error: 'full_name tidak boleh kosong.' });
      }
      payload.full_name = full_name.trim();
    }

    if (email !== undefined) {
      if (!hasText(email)) {
        return res.status(400).json({ error: 'email tidak boleh kosong.' });
      }
      payload.email = email.trim();
    }

    if (member_type !== undefined) {
      if (!hasText(member_type)) {
        return res.status(400).json({ error: 'member_type tidak boleh kosong.' });
      }

      const normalizedMemberType = member_type.trim().toUpperCase();
      if (!ALLOWED_MEMBER_TYPES.has(normalizedMemberType)) {
        return res.status(400).json({
          error: 'member_type hanya boleh STUDENT, FACULTY, atau STAFF.'
        });
      }

      payload.member_type = normalizedMemberType;
    }

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ error: 'Tidak ada field yang dikirim untuk diupdate.' });
    }

    try {
      const updatedMember = await MemberModel.updateById(id, payload);
      if (!updatedMember) {
        return res.status(404).json({ error: 'Member tidak ditemukan.' });
      }

      return res.json(updatedMember);
    } catch (err) {
      return sendDatabaseError(res, err);
    }
  },

  async deleteMember(req, res) {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res.status(400).json({ error: 'Format ID member tidak valid.' });
    }

    try {
      const deleted = await MemberModel.deleteById(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Member tidak ditemukan.' });
      }

      return res.json({ message: 'Member berhasil dihapus.' });
    } catch (err) {
      return sendDatabaseError(res, err);
    }
  }
};