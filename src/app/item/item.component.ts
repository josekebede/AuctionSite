import { Item } from './../models/items';
import { ServiceService } from 'src/app/services/service.service';
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {

  @Input() auctionEnd = "2022-02-30T23:00:00+03:00";
  @Input() item!: Item
  code!: string;
  auctionID!: string;
  wishlistDisabled!: boolean;

  @Input() isBid = false;
  @Input() inWishlist = false;
  @Input() isSpecial = false;
  @Input() bidID = "0"

  imageDirty = false;
  imageUploaded = false;
  uploadUrl = "";

  imageURL: SafeResourceUrl = "";
  timeLeft: string = "0";
  bidGroup = new FormGroup({
    bid: new FormControl('', Validators.required)
  });

  proofGroup = new FormGroup({
    proofImage: new FormControl('', Validators.required)
  })

  wishlistSub: Subscription;
  constructor(private sanitizer: DomSanitizer, private service: ServiceService) {
    this.wishlistSub = this.service.getWishlistListner().subscribe(
      data => {
        if (this.code == data)
          this.wishlistDisabled = true;
      }
    )


  }

  getDifference(endTimeInSeconds: Date) {

    let difference = (endTimeInSeconds.getTime() - Date.now()) / 1000;
    let endDateArray: string[] = [];

    let dateDiff = Math.floor(difference / (60 * 60 * 24))
    if (dateDiff > 1)
      endDateArray.push(dateDiff + " Days")
    if (dateDiff == 1)
      endDateArray.push(dateDiff + " Day")

    let timeLeft = difference % (3600 * 24)
    let hourDiff = Math.floor(timeLeft / (60 * 60))
    if (hourDiff > 1)
      endDateArray.push(hourDiff + " Hours")
    if (hourDiff == 1)
      endDateArray.push(hourDiff + " Hour")

    timeLeft = difference % (3600)
    let minDiff = Math.floor(timeLeft / (60))
    if (minDiff > 1)
      endDateArray.push(minDiff + " Minutes")
    if (minDiff == 1)
      endDateArray.push(minDiff + " Minute")

    timeLeft = difference % (60)
    let secDiff = Math.floor(timeLeft)
    if (secDiff > 1)
      endDateArray.push(secDiff + " Seconds")
    if (secDiff == 1)
      endDateArray.push(secDiff + " Second")
    // this.endDate =
    let finalDay = "";
    if (endDateArray.length > 1)
      finalDay = endDateArray[0] + " and " + endDateArray[1];
    else if (endDateArray.length == 1)
      finalDay = endDateArray[0];
    else if (endDateArray.length == 0)
      finalDay = "AUCTION FINISHED";

    if (difference <= 0)
      finalDay = "AUCTION FINISHED";

    return finalDay;

  }
  ngOnInit(): void {
    this.code = this.item.code;
    this.auctionID = this.item.auctionID;
    this.wishlistDisabled = this.item.wishlist;

    let endTimeInSeconds = new Date(this.auctionEnd);
    this.timeLeft = this.getDifference(endTimeInSeconds);
    setInterval(() => {
      this.timeLeft = this.getDifference(endTimeInSeconds);
    }, 1000);

    this.imageURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.item.picture);
  }

  bidSubmit(form: HTMLFormElement, formDirective: FormGroupDirective) {
    if (this.bidGroup.valid) {
      // auctionID, itemCode, amount
      let data = {
        amount: this.bidGroup.get("bid")?.value,
        itemCode: this.code,
        auctionID: this.auctionID
      }
      this.service.bidItem(data);
      this.bidGroup.controls["bid"]!.patchValue("")
      delete this.bidGroup.controls["bid"]!.errors!["required"];
      this.bidGroup.controls["bid"]!.markAsPristine();
      this.bidGroup.controls["bid"]!.markAsUntouched();
      this.bidGroup.controls["bid"]!.markAsPending();
    }
  }

  imageClicked() {
    this.imageDirty = true;
  }


  resetImage() {
    this.imageDirty = false;
    this.imageUploaded = false;
    this.imageURL = ""
    // this.itemForm.controls["picture"].patchValue(null)
  }

  imageChanged(event: Event) {
    const image = (event.target as HTMLInputElement).files![0];
    if (image) { // If an image is chosen
      this.imageUploaded = true;

      // The following steps are used to add the image to our form
      let reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onload = () => {
        this.uploadUrl = String(reader.result)
        this.proofGroup.controls["proofImage"]!.patchValue(image)
      };
    } else { // If no image is chosen
      this.imageUploaded = false;
      this.uploadUrl = ""
      this.proofGroup.controls["proofImage"].patchValue(null)
    }
  }

  uploadClicked() {
    this.imageClicked();
    if (this.proofGroup.valid) {
      if (window.confirm("Are you sure you want to upload this bank slip?")) {
        this.service.sendBidProof(this.proofGroup, this.bidID)
      }
    }
  }
  hasError(control: string, error?: string, notError?: string) {
    if (notError != undefined) {
      return this.bidGroup.controls[control].touched &&
        this.bidGroup.controls[control].hasError(error!) &&
        !this.bidGroup.controls[control].hasError(notError)
    } else {
      if (error != undefined)
        return this.bidGroup.controls[control].touched &&
          this.bidGroup.controls[control]!.hasError(error);
      else
        return this.bidGroup.controls[control].touched &&
          !this.bidGroup.controls[control].valid;
    }
  }
  deleteItem() {
    if (this.isBid)
      this.service.deleteBid(this.bidID);
    else
      this.service.deleteWishlistItem(this.code)
  }

  wishlistClick() {
    this.service.addItemToWishlist(this.code);
  }
}
