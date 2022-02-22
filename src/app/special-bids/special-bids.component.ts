import { ServiceService } from './../services/service.service';
import { Subscription } from 'rxjs';
import { SpecialItem } from './../models/specialItem';
import { Component, OnInit } from '@angular/core';
import { Item } from '../models/items';

@Component({
  selector: 'app-special-bids',
  templateUrl: './special-bids.component.html',
  styleUrls: ['./special-bids.component.scss']
})
export class SpecialBidsComponent implements OnInit {
  specialItems: SpecialItem[] = [];
  items: Item[] = [];
  specialItemsSub: Subscription;
  bidSub: Subscription;
  constructor(private service: ServiceService) {
    this.specialItemsSub = this.service.getSpecialItems().subscribe(
      data => {
        this.specialItems = data;
        for (let i = 0; i < this.specialItems.length; i++) {
          this.items.push({
            title: this.specialItems[i].title,
            type: this.specialItems[i].type,
            code: this.specialItems[i].code,
            initialBid: this.specialItems[i].initialBid,
            auctionID: this.specialItems[i].auctionID,
            wishlist: false,
            picture: this.specialItems[i].picture
          })
        }
      }
    )

    this.bidSub = this.service.getSuccessfulBid().subscribe(
      data => {
        for (let i = 0; i < this.items.length; i++) {
          if (this.items[i].code == data) {
            this.deleteItem(i)
          }
        }

        this.service.popup("Bid Successful. Waiting for Bank Slip")
      }
    )
  }

  deleteItem(index: number) {
    this.items.splice(index, 1);
    this.specialItems.splice(index, 1);
  }
  ngOnInit(): void {
    this.service.fetchSpecialItems();
  }

}
