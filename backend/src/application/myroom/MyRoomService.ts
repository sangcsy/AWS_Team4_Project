import { MyRoom } from '../../domain/myroom/MyRoom';
import { MyRoomRepository } from '../../domain/myroom/MyRoomRepository';
import { UserRepository } from '../../domain/user/UserRepository';

export class MyRoomService {
  private myRoomRepository: MyRoomRepository;
  private userRepository: UserRepository;

  constructor(myRoomRepository: MyRoomRepository, userRepository: UserRepository) {
    this.myRoomRepository = myRoomRepository;
    this.userRepository = userRepository;
  }

  async createMyRoom(props: {
    userId: string;
    nickname: string;
    temperature: number;
    items: string[];
    avatar: string;
    background: string;
    summary: string;
  }): Promise<MyRoom> {
    const myroom = new MyRoom(props);
    await this.myRoomRepository.save(myroom);
    return myroom;
  }

  async getMyRoom(nickname: string): Promise<MyRoom | null> {
    return this.myRoomRepository.findByNickname(nickname);
  }

  async updateMyRoom(nickname: string, updates: Partial<MyRoom>): Promise<MyRoom | null> {
    const myroom = await this.myRoomRepository.findByNickname(nickname);
    if (!myroom) return null;
    Object.assign(myroom, updates);
    await this.myRoomRepository.update(myroom);
    return myroom;
  }
}