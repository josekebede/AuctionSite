import { ServiceService } from 'src/app/services/service.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Item } from '../models/items';


@Component({
  selector: 'app-items-list',
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.scss']
})
export class ItemsListComponent implements OnInit, OnDestroy {

  auctionItemsSub: Subscription;
  selectedCategorySub: Subscription;
  auctionItems: any[] = [];
  itemsInCategory = [];

  selectedCategory: string;
  selectedItems: Item[] = [];

  bidSuccess: Subscription;

  constructor(private service: ServiceService) {
    this.selectedCategory = this.service.selectedCategoryValue;
    this.auctionItemsSub = this.service.getAuctionItems().subscribe(
      data => {
        this.auctionItems = data;
        console.log(data)
        if (data && data.length) {
          this.selectedItems = data[0].categories[this.selectedCategory]
          this.selectItem();
        }
      }

    );

    this.selectedCategorySub = this.service.getSelectedCategory().subscribe(
      data => {
        this.selectedCategory = data;
        this.selectItem();
      }
    )

    this.bidSuccess = this.service.getSuccessfulBid().subscribe(
      data => {
        this.service.popup("Bid Successful. Waiting for Bank Slip")
        this.deleteItem(data);
        this.selectItem();
      }
    )
  }

  selectItem() {
    if (this.auctionItems.length)
      if (this.auctionItems[0].categories[this.selectedCategory])
        this.selectedItems = this.auctionItems[0].categories[this.selectedCategory];
      else
        this.selectedItems = [];
    else
      this.selectedItems = [];

  }
  deleteItem(itemCode: string) {
    for (let category in this.auctionItems[0].categories) {
      this.auctionItems[0].categories[category].forEach((item: Item, index: number) => {
        if (item.code == itemCode) {
          this.auctionItems[0].categories[category].splice(index, 1); // Removes the element form the array
        }
      })
    }
  }

  ngOnInit(): void {
    this.service.fetchAuctionItems();
    this.service.fetchCategories();
  }

  ngOnDestroy(): void {
    this.auctionItemsSub.unsubscribe();
    this.selectedCategorySub.unsubscribe();
    this.bidSuccess.unsubscribe();
  }
}
