import { ReportModel } from '../models/reportModel.js';

export const ReportController = {
  async getStats(req, res) {
    try {
      const stats = await ReportModel.getLibraryStats();
      return res.json({
        ...stats,
        generated_at: new Date().toISOString()
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};
