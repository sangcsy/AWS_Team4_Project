import { MyRoom, MyRoomItem, CreateMyRoomRequest, UpdateMyRoomRequest } from './MyRoom';

export interface MyRoomRepository {
  // 마이룸 CRUD
  create(userId: string, data: CreateMyRoomRequest): Promise<MyRoom>;
  findByUserId(userId: string): Promise<MyRoom | null>;
  update(userId: string, data: UpdateMyRoomRequest): Promise<MyRoom>;
  delete(userId: string): Promise<void>;
  
  // 온도 관리
  updateTemperature(userId: string, temperatureChange: number): Promise<MyRoom>;
  
  // 아이템 관리
  addItem(myroomId: string, item: Omit<MyRoomItem, 'id' | 'myroom_id' | 'created_at'>): Promise<MyRoomItem>;
  getItems(myroomId: string): Promise<MyRoomItem[]>;
  removeItem(itemId: string, myroomId: string): Promise<void>;
  
  // 온도 히스토리 (향후 확장용)
  getTemperatureHistory(userId: string, limit?: number): Promise<Array<{ temperature: number; timestamp: Date; reason: string }>>;
}
