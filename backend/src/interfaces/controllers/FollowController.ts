import { Request, Response } from 'express';
import { FollowService } from '../../application/follow/FollowService';

export class FollowController {
  private followService: FollowService;

  constructor(followService: FollowService) {
    this.followService = followService;
  }

  follow = async (req: Request, res: Response) => {
    const { nickname } = req.params;
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: '인증 필요' });
    const ok = await this.followService.follow(user.userId, nickname);
    if (!ok) return res.status(404).json({ error: '대상 유저 없음' });
    res.status(200).json({ success: true });
  };

  unfollow = async (req: Request, res: Response) => {
    const { nickname } = req.params;
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: '인증 필요' });
    const ok = await this.followService.unfollow(user.userId, nickname);
    if (!ok) return res.status(404).json({ error: '대상 유저 없음' });
    res.status(200).json({ success: true });
  };

  feed = async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: '인증 필요' });
    const feed = await this.followService.getFeed(user.userId);
    res.status(200).json(feed);
  };
}