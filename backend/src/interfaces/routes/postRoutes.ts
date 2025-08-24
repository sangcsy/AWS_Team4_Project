const { Router } = require('express');
const { PostController } = require('../controllers/PostController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = Router();
const postController = new PostController();

// 게시글 작성 (인증 필요)
router.post('/', authMiddleware, postController.createPost);

// 게시글 조회 (인증 불필요)
router.get('/', postController.getAllPosts);
router.get('/search', postController.searchPosts);
router.get('/:id', postController.getPostById);
router.get('/user/:userId', postController.getPostsByUser);

// 게시글 수정 (인증 필요)
router.put('/:id', authMiddleware, postController.updatePost);

// 게시글 삭제 (인증 필요)
router.delete('/:id', authMiddleware, postController.deletePost);

// 게시글 온도 업데이트 (인증 불필요)
router.patch('/:id/temperature', postController.updatePostTemperature);

// 좋아요 토글 (인증 필요)
router.post('/:id/like', authMiddleware, postController.toggleLike);

module.exports = router;
