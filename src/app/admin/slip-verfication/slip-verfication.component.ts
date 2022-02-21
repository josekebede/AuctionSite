import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { Slip } from 'src/app/models/slip';
import { ServiceService } from 'src/app/services/service.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-slip-verfication',
  templateUrl: './slip-verfication.component.html',
  styleUrls: ['./slip-verfication.component.scss']
})
export class SlipVerficationComponent implements OnInit, OnDestroy {

  slips: Slip[] = [];
  slipsSub: Subscription;
  slipVerified: Subscription;
  constructor(private service: ServiceService, private sanitizer: DomSanitizer) {
    this.slipsSub = this.service.getSlips().subscribe(
      data => {
        this.slips = data;
        for (let i = 0; i < this.slips.length; i++) {
          this.slips[i].slipResource = this.sanitizer.bypassSecurityTrustResourceUrl(this.slips[i].slip);
        }
      }
    )

    this.slipVerified = this.service.getSlipStatus().subscribe(
      data => {
        for (let i = 0; i < this.slips.length; i++) {
          if (this.slips[i].bidID == data.slipID)
            this.slips.splice(i, 1);
        }
        if (data.status)
          this.service.popup("Slip Verified")
        else
          this.service.popup("Slip Rejected")
      }
    )
  }

  slipVerify(bidID: string, name: string) {
    if (window.confirm(`Are you sure you want to verify the slip from ${name}?`))
      this.service.verifySlip(bidID);
  }

  slipReject(bidID: string, name: string) {
    if (window.confirm(`Are you sure you want to reject the slip from ${name}?`))
      this.service.rejectSlip(bidID);
  }
  ngOnInit(): void {
    this.service.fetchSlips();
  }

  ngOnDestroy(): void {
    this.slipsSub.unsubscribe();
  }

}
