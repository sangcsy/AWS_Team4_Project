import { Request, Response } from 'express';
import { MyRoomService } from '../../application/myroom/MyRoomService';

export class MyRoomController {
  private myRoomService: MyRoomService;

  constructor(myRoomService: MyRoomService) {
    this.myRoomService = myRoomService;
  }

  get = async (req: Request, res: Response) => {
    const { nickname } = req.params;
    const myroom = await this.myRoomService.getMyRoom(nickname);
    if (!myroom) return res.status(404).json({ error: '마이룸 없음' });
    res.json(myroom);
  };

  update = async (req: Request, res: Response) => {
    const { nickname } = req.params;
    const updates = req.body;
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: '인증 필요' });
    if (user.nickname !== nickname) return res.status(403).json({ error: '수정 권한 없음' });
    const myroom = await this.myRoomService.updateMyRoom(nickname, updates);
    if (!myroom) return res.status(404).json({ error: '마이룸 없음' });
    res.json(myroom);
  };
}