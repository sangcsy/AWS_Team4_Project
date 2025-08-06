import express from 'express';
import bodyParser from 'body-parser';
import { UserRepositoryImpl } from './infrastructure/user/UserRepositoryImpl';
import { UserService } from './application/user/UserService';
import { UserController } from './interfaces/controllers/UserController';
import { createUserRoutes } from './interfaces/routes/userRoutes';
import { PostRepositoryImpl } from './infrastructure/post/PostRepositoryImpl';
import { PostService } from './application/post/PostService';
import { PostController } from './interfaces/controllers/PostController';
import { createPostRoutes } from './interfaces/routes/postRoutes';
import { CommentRepositoryImpl } from './infrastructure/comment/CommentRepositoryImpl';
import { CommentService } from './application/comment/CommentService';
import { CommentController } from './interfaces/controllers/CommentController';
import { createCommentRoutes } from './interfaces/routes/commentRoutes';
import { MyRoomRepositoryImpl } from './infrastructure/myroom/MyRoomRepositoryImpl';
import { MyRoomService } from './application/myroom/MyRoomService';
import { MyRoomController } from './interfaces/controllers/MyRoomController';
import { createMyRoomRoutes } from './interfaces/routes/myroomRoutes';
import { FollowRepositoryImpl } from './infrastructure/follow/FollowRepositoryImpl';
import { FollowService } from './application/follow/FollowService';
import { FollowController } from './interfaces/controllers/FollowController';
import { createFollowRoutes } from './interfaces/routes/followRoutes';
import { MarketRepositoryImpl } from './infrastructure/market/MarketRepositoryImpl';
import { MarketService } from './application/market/MarketService';
import { MarketController } from './interfaces/controllers/MarketController';
import { createMarketRoutes } from './interfaces/routes/marketRoutes';
import { ReviewRepositoryImpl } from './infrastructure/review/ReviewRepositoryImpl';
import { ReviewService } from './application/review/ReviewService';
import { ReviewController } from './interfaces/controllers/ReviewController';
import { createReviewRoutes } from './interfaces/routes/reviewRoutes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './interfaces/docs/swagger';

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

export default app;