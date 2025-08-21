import { Request, Response } from 'express';
import { CommentService } from '../../application/comment/CommentService';

export class CommentController {
  private commentService: CommentService;

  constructor(commentService: CommentService) {
    this.commentService = commentService;
  }

  create = async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { content } = req.body;
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: '인증 필요' });
    const comment = await this.commentService.createComment(user.userId, postId, content);
    res.status(201).json(comment);
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: '인증 필요' });
    const ok = await this.commentService.deleteComment(id, user.userId);
    if (!ok) return res.status(403).json({ error: '삭제 권한 없음' });
    res.status(204).send();
  };

  listByPost = async (req: Request, res: Response) => {
    const { postId } = req.params;
    const comments = await this.commentService.getCommentsByPost(postId);
    res.json(comments);
  };
}