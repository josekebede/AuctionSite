import { ServiceService } from 'src/app/services/service.service';
import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit, OnDestroy {

  message: string | string[] = "Tempo";
  messageArray: string[] = [];
  error = false;
  shown = false
  popupListner: Subscription
  constructor(private service: ServiceService) {
    this.popupListner = this.service.getPopupListner().subscribe(
      data => {
        this.message = data.message;
        if (Array.isArray(data.message))
          this.messageArray = data.message;
        else
          this.messageArray = [];
        this.error = data.error;
        this.showMessage();
      }
    )
  }

  isString(input: any) {
    return (typeof input) == "string"
  }
  ngOnInit(): void {

  }

  showMessage() {
    let timeout = this.messageArray.length ? 3000 : 1500;
    this.shown = true;
    setTimeout(() => {
      this.shown = false;
    }, timeout);
  }

  ngOnDestroy(): void {
    this.popupListner.unsubscribe();
  }

}
