import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { Item } from './../../models/items';
import { ServiceService } from './../../services/service.service';
import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';

interface auction {
  id: string;
  startDate: string;
  endDate: string;
  items: Item[];
  images: SafeResourceUrl[];
  special: boolean;
}
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {
  auctionsSub: Subscription;
  auctions: auction[] = [];

  pastAuctions: auction[] = []
  pastImages: SafeResourceUrl[] = [];

  currentAuctions: auction[] = []
  currentImages: SafeResourceUrl[] = [];

  futureAucitons: auction[] = []
  futureImages: SafeResourceUrl[] = [];

  images: SafeResourceUrl[] = [];
  constructor(private service: ServiceService, private sanitizer: DomSanitizer) {
    this.auctionsSub = this.service.getAuctionItems().subscribe(
      data => {
        this.auctions = data;
        for (let i = 0; i < this.auctions.length; i++) {
          this.auctions[i].images = [];
          for (let j = 0; j < this.auctions[i].items.length; j++) {
            this.auctions[i].images.push(this.sanitizer.bypassSecurityTrustResourceUrl(this.auctions[i].items[j].picture))
          }
          let auction = this.auctions[i];
          let now = Date.now();
          let auctionStart = new Date(auction.startDate).getTime();
          let auctionEnd = new Date(auction.endDate).getTime();

          if (auctionStart < now && auctionEnd < now)
            this.pastAuctions.push(this.auctions[i])
          else if (auctionStart > now && auctionEnd > now)
            this.futureAucitons.push(this.auctions[i])
          else
            this.currentAuctions.push(this.auctions[i]);
        }
        console.log(data)
      }

    )
  }

  ngOnInit(): void {
    this.service.fetchAllAuctionItems();
  }

}
