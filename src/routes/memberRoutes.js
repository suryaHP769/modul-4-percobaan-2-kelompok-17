import express from 'express';
import { MemberController } from '../controllers/memberController.js';

const router = express.Router();

// GET /api/members
router.get('/', MemberController.getAllMembers);
router.get('/:id', MemberController.getMemberById);

// POST /api/members
router.post('/', MemberController.registerMember);
router.put('/:id', MemberController.updateMember);
router.delete('/:id', MemberController.deleteMember);

export default router;