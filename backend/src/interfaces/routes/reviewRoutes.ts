import { Router } from 'express';

const router = Router();

// 임시 라우트 (나중에 구현)
router.get('/', (req, res) => {
  res.json({ message: 'Review route - Coming soon' });
});

export default router;
