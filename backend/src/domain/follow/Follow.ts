export interface FollowProps {
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export class Follow {
  followerId: string;
  followingId: string;
  createdAt: Date;

  constructor(props: FollowProps) {
    this.followerId = props.followerId;
    this.followingId = props.followingId;
    this.createdAt = props.createdAt;
  }
}