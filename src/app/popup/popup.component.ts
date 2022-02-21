import { ServiceService } from 'src/app/services/service.service';
import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit, OnDestroy {

  message: string = "Tempo";
  error = false;
  shown = false
  popupListner: Subscription
  constructor(private service: ServiceService) {
    this.popupListner = this.service.getPopupListner().subscribe(
      data => {
        this.message = data.message;
        this.error = data.error;
        this.showMessage();
      }
    )
  }

  ngOnInit(): void {

  }

  showMessage() {
    this.shown = true;
    setTimeout(() => {
      this.shown = false;
      this.error = false;
    }, 1500);
  }

  ngOnDestroy(): void {
    this.popupListner.unsubscribe();
  }

}
