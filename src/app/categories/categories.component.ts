import { ServiceService } from './../services/service.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, OnDestroy {


  itemsSub: Subscription;
  constructor(private service: ServiceService) {
    this.itemsSub = this.service.getItems().subscribe(
      data => {
        console.log(data);
      }
    )
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.itemsSub.unsubscribe();
  }

}
