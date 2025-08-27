import { Router } from 'express';
import { UploadController } from '../controllers/UploadController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const uploadController = new UploadController();

// 이미지 업로드 (인증 필요)
router.post('/image', authMiddleware, uploadController.uploadImage);

// 이미지 삭제 (인증 필요)
router.delete('/image/:filename', authMiddleware, uploadController.deleteImage);

export default router;
