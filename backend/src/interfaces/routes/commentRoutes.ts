import express from 'express';
import { CommentController } from '../controllers/CommentController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();
const commentController = new CommentController();

// 댓글 작성 (인증 필요)
router.post('/posts/:postId/comments', authMiddleware, commentController.createComment);

// 댓글 조회 (인증 불필요)
router.get('/comments/:id', commentController.getCommentById);
router.get('/posts/:postId/comments', commentController.getCommentsByPost);
router.get('/users/:userId/comments', commentController.getCommentsByUser);

// 댓글 수정 (인증 필요)
router.put('/comments/:id', authMiddleware, commentController.updateComment);

// 댓글 삭제 (인증 필요)
router.delete('/comments/:id', authMiddleware, commentController.deleteComment);

// 댓글 온도 업데이트 (인증 불필요)
router.patch('/comments/:id/temperature', commentController.updateCommentTemperature);

export default router;
