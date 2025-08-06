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

const app = express();
app.use(bodyParser.json());

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

app.use('/api', createUserRoutes(userController));
app.use('/api', createPostRoutes(postController));
app.use('/api', createCommentRoutes(commentController));
app.use('/api', createMyRoomRoutes(myRoomController));
app.use('/api', createFollowRoutes(followController));

export default app;