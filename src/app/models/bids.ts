export interface Bid {
  auctionID: string;
  itemCode: string;
  userID: string;
  amount: number;
  pending: Boolean;
  title: string;
  type: string;
  image: string;
  auctionEnd: string;
  bidID: string;
}
