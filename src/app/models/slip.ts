import { SafeResourceUrl } from '@angular/platform-browser';
export interface Slip {
  bidID: string;
  currentBid: Number;
  initialBid: Number;
  itemCode: string;
  itemTitle: string;
  slip: string;
  slipResource?: SafeResourceUrl;
  special: boolean;
  userFullName: string;
}
