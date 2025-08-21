export interface MarketProps {
  id: string;
  sellerId: string;
  title: string;
  desc: string;
  price: number;
  createdAt: Date;
}

export class Market {
  id: string;
  sellerId: string;
  title: string;
  desc: string;
  price: number;
  createdAt: Date;

  constructor(props: MarketProps) {
    this.id = props.id;
    this.sellerId = props.sellerId;
    this.title = props.title;
    this.desc = props.desc;
    this.price = props.price;
    this.createdAt = props.createdAt;
  }
}