import { ServiceService } from 'src/app/services/service.service';
import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { Wishlist } from '../models/wishlist';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {

  wishlistSub: Subscription;
  bidSuccess: Subscription;
  deletedWishlist!: Subscription;
  wishlist!: Wishlist;
  constructor(private service: ServiceService) {
    this.wishlistSub = this.service.getWishlist().subscribe(
      data => {
        this.wishlist = data;
      }
    );


    this.bidSuccess = this.service.getSuccessfulBid().subscribe(
      data => {
        this.deleteItem(data);
        this.service.popup("Item in pending list. Waiting for bank slip")
      }
    );

    this.deletedWishlist = this.service.getDeletedItem().subscribe(
      itemCode => {
        for (let i = 0; i < this.wishlist.items.length; i++) {
          if (this.wishlist.items[i].code == itemCode) {
            this.deleteItem(itemCode)
            this.service.popup("Wishlist Item Deleted")
          }
        }
      }
    )
  }

  deleteItem(itemCode: string) {
    for (let i = 0; i < this.wishlist.items.length; i++) {
      if (this.wishlist.items[i].code == itemCode)
        this.wishlist.items.splice(i, 1);
    }
  }

  ngOnInit(): void {
    this.service.fetchWishlist();
  }

}
