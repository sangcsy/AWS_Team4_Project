import { MyRoom } from '../../domain/myroom/MyRoom';
import { MyRoomRepository } from '../../domain/myroom/MyRoomRepository';

export class MyRoomRepositoryImpl implements MyRoomRepository {
  private myrooms: MyRoom[] = [];

  async findByNickname(nickname: string): Promise<MyRoom | null> {
    return this.myrooms.find(m => m.nickname === nickname) || null;
  }

  async save(myroom: MyRoom): Promise<void> {
    this.myrooms.push(myroom);
  }

  async update(myroom: MyRoom): Promise<void> {
    const idx = this.myrooms.findIndex(m => m.userId === myroom.userId);
    if (idx !== -1) this.myrooms[idx] = myroom;
  }
}