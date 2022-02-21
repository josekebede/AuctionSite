import { ServiceService } from 'src/app/services/service.service';
import { Subscription } from 'rxjs';
import { Component, Input, OnInit } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { Item } from 'src/app/models/items';

interface auction {
  id: string;
  startDate: string;
  endDate: string;
  items: Item[];
  images: SafeResourceUrl[];
  special: boolean;
}

@Component({
  selector: 'app-dashboard-item',
  templateUrl: './dashboard-item.component.html',
  styleUrls: ['./dashboard-item.component.scss']
})
export class DashboardItemComponent implements OnInit {

  @Input() auctions: auction[] = [];
  images: SafeResourceUrl[] = [];
  @Input() hasButtons = false;
  @Input() isPast = true;

  deletedAuctionSub: Subscription;
  deletedItemSub: Subscription;

  constructor(private sanitizer: DomSanitizer, private service: ServiceService) {
    this.deletedAuctionSub = this.service.getDeletedAuction().subscribe(
      data => {
        for (let i = 0; i < this.auctions.length; i++) {
          if (data == this.auctions[i].id) {
            this.auctions.splice(i, 1);
            this.service.popup("Auction Deleted")
          }
        }
      }
    )

    this.deletedItemSub = this.service.getDeletedItemAdmin().subscribe(
      data => {
        for (let i = 0; i < this.auctions.length; i++) {
          for (let j = 0; j < this.auctions[i].items.length; j++) {
            if (this.auctions[i].items[j].code == data) {
              this.auctions[i].items.splice(j, 1);
              if (this.auctions[i].items.length == 0)
                this.auctions.splice(i, 1);
              this.service.popup("Item Deleted")
            }
          }
        }
      }
    )
  }

  ngOnInit(): void {
    console.log(this.auctions)
  }

  formatAuctionTitle(auction: auction) {
    let start = new Date(auction.startDate);
    let end = new Date(auction.endDate);

    let formattedStart = start.toLocaleDateString('en-us', { year: 'numeric', month: 'short', day: 'numeric' });
    let formattedEnd = end.toLocaleDateString('en-us', { year: 'numeric', month: 'short', day: 'numeric' });

    return `${formattedStart} - ${formattedEnd}`
  }


  clickDeleteAuction(auctionID: string) {
    if (window.confirm("Are you sure you want to delete this auction?")) {
      this.service.deleteAuction(auctionID);
    }
  }

  clickItemDelete(item: Item) {
    if (window.confirm(`Are you sure you want to delete item of code ${item.code}?`)) {
      this.service.deleteItemAdmin(item.code)
    }
  }
}
