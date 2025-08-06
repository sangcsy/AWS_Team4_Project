export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  nickname: string;
  temperature: number;
  createdAt: Date;
}

export class User {
  id: string;
  email: string;
  passwordHash: string;
  nickname: string;
  temperature: number;
  createdAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.nickname = props.nickname;
    this.temperature = props.temperature;
    this.createdAt = props.createdAt;
  }
}