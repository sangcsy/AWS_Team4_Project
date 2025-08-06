export interface MyRoomProps {
  userId: string;
  nickname: string;
  temperature: number;
  items: string[];
  avatar: string;
  background: string;
  summary: string;
}

export class MyRoom {
  userId: string;
  nickname: string;
  temperature: number;
  items: string[];
  avatar: string;
  background: string;
  summary: string;

  constructor(props: MyRoomProps) {
    this.userId = props.userId;
    this.nickname = props.nickname;
    this.temperature = props.temperature;
    this.items = props.items;
    this.avatar = props.avatar;
    this.background = props.background;
    this.summary = props.summary;
  }
}