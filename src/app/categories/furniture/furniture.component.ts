import { ServiceService } from 'src/app/services/service.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-furniture',
  templateUrl: './furniture.component.html',
  styleUrls: ['./furniture.component.scss']
})
export class FurnitureComponent implements OnInit, OnDestroy {

  newArray = [
    {
      name: "sdfdsf",
      initialBid: 1233
    },
    {
      name: "asdf",
      initialBid: 1233
    },
    {
      name: "1234",
      initialBid: 1233
    },
    {
      name: "pk",
      initialBid: 1233
    }
  ]
  // array = [1, 2, 3, 4, 5, 6, 6, 6, 6]
  furnitureSub: Subscription;
  constructor(private service: ServiceService) {
    // This subscription is fired when a furniture request has completed
    this.furnitureSub = this.service.getFurniture().subscribe(
      data => {
        console.log(data)
      }
    )
  }

  ngOnInit(): void {
    // Fetches furnitures
  }
  ngOnDestroy(): void {
    this.furnitureSub.unsubscribe();
  }

}
