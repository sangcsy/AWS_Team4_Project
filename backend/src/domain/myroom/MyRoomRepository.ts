import { MyRoom } from './MyRoom';

export interface MyRoomRepository {
  findByNickname(nickname: string): Promise<MyRoom | null>;
  save(myroom: MyRoom): Promise<void>;
  update(myroom: MyRoom): Promise<void>;
}