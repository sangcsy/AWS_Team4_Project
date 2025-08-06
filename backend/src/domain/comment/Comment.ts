export interface CommentProps {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

export class Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;

  constructor(props: CommentProps) {
    this.id = props.id;
    this.postId = props.postId;
    this.authorId = props.authorId;
    this.content = props.content;
    this.createdAt = props.createdAt;
  }
}