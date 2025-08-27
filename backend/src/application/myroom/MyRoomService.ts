import { v4 as uuidv4 } from 'uuid';
import { MyRoomRepository } from '../../domain/myroom/MyRoomRepository';
import { 
  MyRoom, 
  MyRoomItem, 
  CreateMyRoomRequest, 
  UpdateMyRoomRequest, 
  MyRoomResponse, 
  MyRoomItemResponse,
  MyRoomWithItemsResponse 
} from '../../domain/myroom/MyRoom';

export class MyRoomService {
  constructor(private myRoomRepository: MyRoomRepository) {}

  async createMyRoom(userId: string, data: CreateMyRoomRequest): Promise<MyRoomResponse> {
    const myroom = await this.myRoomRepository.create(userId, data);
    return this.toMyRoomResponse(myroom);
  }

  async getMyRoom(userId: string): Promise<MyRoomWithItemsResponse | null> {
    const myroom = await this.myRoomRepository.findByUserId(userId);
    if (!myroom) {
      return null;
    }

    const items = await this.myRoomRepository.getItems(myroom.id);
    const itemResponses = items.map(item => this.toMyRoomItemResponse(item));

    return {
      ...this.toMyRoomResponse(myroom),
      items: itemResponses
    };
  }

  async updateMyRoom(userId: string, data: UpdateMyRoomRequest): Promise<MyRoomResponse> {
    const myroom = await this.myRoomRepository.update(userId, data);
    return this.toMyRoomResponse(myroom);
  }

  async deleteMyRoom(userId: string): Promise<void> {
    await this.myRoomRepository.delete(userId);
  }

  async updateTemperature(userId: string, temperatureChange: number): Promise<MyRoomResponse> {
    const myroom = await this.myRoomRepository.updateTemperature(userId, temperatureChange);
    return this.toMyRoomResponse(myroom);
  }

  async addItem(userId: string, itemData: Omit<MyRoomItem, 'id' | 'myroom_id' | 'created_at'>): Promise<MyRoomItemResponse> {
    const myroom = await this.myRoomRepository.findByUserId(userId);
    if (!myroom) {
      throw new Error('마이룸을 찾을 수 없습니다.');
    }

    const item = await this.myRoomRepository.addItem(myroom.id, itemData);
    return this.toMyRoomItemResponse(item);
  }

  async getItems(userId: string): Promise<MyRoomItemResponse[]> {
    const myroom = await this.myRoomRepository.findByUserId(userId);
    if (!myroom) {
      return [];
    }

    const items = await this.myRoomRepository.getItems(myroom.id);
    return items.map(item => this.toMyRoomItemResponse(item));
  }

  async removeItem(userId: string, itemId: string): Promise<void> {
    const myroom = await this.myRoomRepository.findByUserId(userId);
    if (!myroom) {
      throw new Error('마이룸을 찾을 수 없습니다.');
    }

    await this.myRoomRepository.removeItem(itemId, myroom.id);
  }

  private toMyRoomResponse(myroom: MyRoom): MyRoomResponse {
    return {
      id: myroom.id,
      user_id: myroom.user_id,
      profile_image: myroom.profile_image,
      bio: myroom.bio,
      current_temperature: myroom.current_temperature,
      created_at: myroom.created_at,
      updated_at: myroom.updated_at
    };
  }

  private toMyRoomItemResponse(item: MyRoomItem): MyRoomItemResponse {
    return {
      id: item.id,
      myroom_id: item.myroom_id,
      name: item.name,
      description: item.description,
      item_type: item.item_type,
      rarity: item.rarity,
      acquired_at: item.acquired_at,
      created_at: item.created_at
    };
  }
}
