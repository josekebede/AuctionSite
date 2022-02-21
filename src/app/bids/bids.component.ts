import { ServiceService } from 'src/app/services/service.service';
import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { Bid } from '../models/bids';
import { Item } from '../models/items';

@Component({
  selector: 'app-bids',
  templateUrl: './bids.component.html',
  styleUrls: ['./bids.component.scss']
})
export class BidsComponent implements OnInit {

  bids: Bid[] = [];
  bidItems: Item[] = []
  bidsSub: Subscription;
  deletedBidSub: Subscription;
  proofSuccessSub: Subscription;
  constructor(private service: ServiceService) {
    this.bidsSub = this.service.getBids().subscribe(
      data => {
        this.bids = data;
        data.forEach(bid => {

          let item: Item = {
            title: bid.title,
            type: bid.type,
            code: bid.itemCode,
            initialBid: bid.amount,
            picture: bid.image,
            auctionID: bid.auctionID,
            wishlist: false
          }
          this.bidItems.push(item);
        });
      }
    )

    this.deletedBidSub = this.service.getDeletedItem().subscribe(
      id => {
        for (let i = 0; i < this.bids.length; i++) {
          if (this.bids[i].bidID == id) {
            this.deleteBid(i)
            this.service.popup("Pending Bid Deleted")
          }
        }
      }
    )

    this.proofSuccessSub = this.service.getProof().subscribe(
      id => {
        for (let i = 0; i < this.bids.length; i++) {
          if (this.bids[i].bidID == id) {
            this.deleteBid(i)
            this.service.popup("Bank Slip Sent")
          }
        }
      }
    )
  }

  deleteBid(index: number) {
    if (this.bidItems.length == 1)
      this.bidItems = [];
    else
      this.bidItems.splice(index, 1);

    if (this.bids.length == 1)
      this.bids = [];
    else
      this.bids.splice(index, 1);
  }
  ngOnInit(): void {
    this.service.fetchBids();
  }

}
