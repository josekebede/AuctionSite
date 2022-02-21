export interface Furniture {
  type: string;
  end: string;
}

export interface Item {
  title: string;
  type: string;
  code: string;
  initialBid: number;
  picture: string;
  auctionID: string;
  wishlist: boolean;
  highestBid?: number;
  fullName?: string;
  userID?: string
}
