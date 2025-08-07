const express = require('express');
const bodyParser = require('body-parser');
const { UserRepositoryImpl } = require('./infrastructure/user/UserRepositoryImpl');
const { UserService } = require('./application/user/UserService');
const { UserController } = require('./interfaces/controllers/UserController');
const { createUserRoutes } = require('./interfaces/routes/userRoutes');
const { PostRepositoryImpl } = require('./infrastructure/post/PostRepositoryImpl');
const { PostService } = require('./application/post/PostService');
const { PostController } = require('./interfaces/controllers/PostController');
const { createPostRoutes } = require('./interfaces/routes/postRoutes');
const { CommentRepositoryImpl } = require('./infrastructure/comment/CommentRepositoryImpl');
const { CommentService } = require('./application/comment/CommentService');
const { CommentController } = require('./interfaces/controllers/CommentController');
const { createCommentRoutes } = require('./interfaces/routes/commentRoutes');
const { MyRoomRepositoryImpl } = require('./infrastructure/myroom/MyRoomRepositoryImpl');
const { MyRoomService } = require('./application/myroom/MyRoomService');
const { MyRoomController } = require('./interfaces/controllers/MyRoomController');
const { createMyRoomRoutes } = require('./interfaces/routes/myroomRoutes');
const { FollowRepositoryImpl } = require('./infrastructure/follow/FollowRepositoryImpl');
const { FollowService } = require('./application/follow/FollowService');
const { FollowController } = require('./interfaces/controllers/FollowController');
const { createFollowRoutes } = require('./interfaces/routes/followRoutes');
const { MarketRepositoryImpl } = require('./infrastructure/market/MarketRepositoryImpl');
const { MarketService } = require('./application/market/MarketService');
const { MarketController } = require('./interfaces/controllers/MarketController');
const { createMarketRoutes } = require('./interfaces/routes/marketRoutes');
const { ReviewRepositoryImpl } = require('./infrastructure/review/ReviewRepositoryImpl');
const { ReviewService } = require('./application/review/ReviewService');
const { ReviewController } = require('./interfaces/controllers/ReviewController');
const { createReviewRoutes } = require('./interfaces/routes/reviewRoutes');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./interfaces/docs/swagger');

const app = express();
app.use(bodyParser.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// DI
const userRepository = new UserRepositoryImpl();
const myRoomRepository = new MyRoomRepositoryImpl();
const myRoomService = new MyRoomService(myRoomRepository, userRepository);
const userService = new UserService(userRepository);
const userController = new UserController(userService, myRoomService);

const postRepository = new PostRepositoryImpl();
const postService = new PostService(postRepository, userRepository);
const postController = new PostController(postService);

const commentRepository = new CommentRepositoryImpl();
const commentService = new CommentService(commentRepository, userRepository);
const commentController = new CommentController(commentService);

const myRoomController = new MyRoomController(myRoomService);

const followRepository = new FollowRepositoryImpl();
const followService = new FollowService(followRepository, userRepository, postRepository);
const followController = new FollowController(followService);

const marketRepository = new MarketRepositoryImpl();
const reviewRepository = new ReviewRepositoryImpl();
const marketService = new MarketService(marketRepository, userRepository, reviewRepository);
const marketController = new MarketController(marketService);
const reviewService = new ReviewService(reviewRepository, userRepository);
const reviewController = new ReviewController(reviewService);

app.use('/api', createUserRoutes(userController));
app.use('/api', createPostRoutes(postController));
app.use('/api', createCommentRoutes(commentController));
app.use('/api', createMyRoomRoutes(myRoomController));
app.use('/api', createFollowRoutes(followController));
app.use('/api', createMarketRoutes(marketController));
app.use('/api', createReviewRoutes(reviewController));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'TEMPUS Backend is running' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 TEMPUS Backend server is running on port ${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;