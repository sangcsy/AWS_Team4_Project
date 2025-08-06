import { Request, Response } from 'express';
import { PostService } from '../../application/post/PostService';

export class PostController {
  private postService: PostService;

  constructor(postService: PostService) {
    this.postService = postService;
  }

  create = async (req: Request, res: Response) => {
    const { title, content } = req.body;
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: '인증 필요' });
    const post = await this.postService.createPost(user.userId, title, content);
    res.status(201).json(post);
  };

  get = async (req: Request, res: Response) => {
    const { id } = req.params;
    const post = await this.postService.getPost(id);
    if (!post) return res.status(404).json({ error: '게시글 없음' });
    res.json(post);
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: '인증 필요' });
    const post = await this.postService.updatePost(id, user.userId, title, content);
    if (!post) return res.status(403).json({ error: '수정 권한 없음' });
    res.json(post);
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: '인증 필요' });
    const ok = await this.postService.deletePost(id, user.userId);
    if (!ok) return res.status(403).json({ error: '삭제 권한 없음' });
    res.status(204).send();
  };

  list = async (req: Request, res: Response) => {
    const posts = await this.postService.listPosts();
    res.json(posts);
  };
}