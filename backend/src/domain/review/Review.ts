export interface ReviewProps {
  id: string;
  marketId: string;
  reviewerId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export class Review {
  id: string;
  marketId: string;
  reviewerId: string;
  rating: number;
  comment: string;
  createdAt: Date;

  constructor(props: ReviewProps) {
    this.id = props.id;
    this.marketId = props.marketId;
    this.reviewerId = props.reviewerId;
    this.rating = props.rating;
    this.comment = props.comment;
    this.createdAt = props.createdAt;
  }
}