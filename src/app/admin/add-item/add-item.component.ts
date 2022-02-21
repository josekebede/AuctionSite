import { ServiceService } from 'src/app/services/service.service';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Auction } from 'src/app/models/auction';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss']
})
export class AddItemComponent implements OnInit {

  categoriesSub: Subscription;
  categories: string[] = [];
  imageDirty = false;
  imageUploaded = false;
  imageURL = "";
  auctionSub: Subscription;
  newAuction = true;
  auctions: Auction[] = [];

  _itemFormInitState = {};
  itemForm: FormGroup;
  // This is the form group where all the 'Form Controls' are grouped
  constructor(private service: ServiceService) {
    this.itemForm = new FormGroup({
      title: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),
      initialBid: new FormControl('', Validators.required),
      picture: new FormControl('', Validators.required),
      auctionSelect: new FormControl(''),
      auctionStart: new FormControl(''),
      auctionEnd: new FormControl('')
    })
    this._itemFormInitState = this.itemForm.value;
    // This subscription fires when the categories are fetched from our backend
    this.categoriesSub = this.service.getCategories().subscribe(
      data => {
        this.categories = data;
      }
    );

    this.auctionSub = this.service.getAuctions().subscribe(
      data => {
        this.auctions = data;
      }
    )
  }

  ngOnInit(): void {
    // This function fetches categories from our backend
    this.service.fetchCategories();
    this.service.fetchAuctions();
  }

  onSubmit(formDirective: FormGroupDirective, form: HTMLFormElement) {
    this.checkAuctionError();
    this.imageClicked();
    if (this.auctions.length == 0 && !this.newAuction) {
      alert("An Auction is required");
      return;
    }

    // Checks if the form is valid
    if (this.itemForm.valid) {
      this.service.addItem(this.itemForm, this.newAuction); // Submits the form
      formDirective.resetForm(this._itemFormInitState);
      form.reset();
      this.resetImage();
      this.service.popup("Item Added")
    }
  }

  // This occurs if the image input is clicked
  imageClicked() {
    this.imageDirty = true;
  }

  resetImage() {
    this.imageDirty = false;
    this.imageUploaded = false;
    this.imageURL = ""
    this.itemForm.controls["picture"].patchValue(null)
  }

  // This occurs when the dialog box (when the picture is clicked) has chosen a file or cancel is clicked
  imageChanged(event: Event) {
    const image = (event.target as HTMLInputElement).files![0];
    console.log(image)
    if (image) { // If an image is chosen
      this.imageUploaded = true;

      // The following steps are used to add the image to our form
      let reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onload = () => {
        this.imageURL = String(reader.result)
        this.itemForm.controls["picture"].patchValue(image)
      };
    } else { // If no image is chosen
      this.imageUploaded = false;
      this.imageURL = ""
      this.itemForm.controls["picture"].patchValue(null)
    }
  }

  newClicked() {
    this.newAuction = true;
    this.checkAuctionError()
  }
  existingClicked() {
    this.newAuction = false;
    this.checkAuctionError()
  }

  checkAuctionError() {
    let auctionSelect = this.getControl("auctionSelect");
    let auctionStart = this.getControl("auctionStart");
    let auctionEnd = this.getControl("auctionEnd");
    if (this.newAuction) {
      if (!auctionStart.hasError("matDatepickerParse")) {
        if (auctionStart.value == "" || auctionStart.value == null) {
          auctionStart.setErrors({ required: true })
        } else {
          if (auctionStart.hasError("required"))
            delete auctionStart.errors!["required"];
        }
      }

      if (!auctionEnd.hasError("matDatepickerParse")) {
        if (auctionEnd.value == "" || auctionEnd.value == null) {
          auctionEnd.setErrors({ required: true })
        } else {
          if (auctionEnd.hasError("required"))
            delete auctionEnd.errors!["required"];
        }
      }
    } else {
      if (this.auctions.length > 0) {
        if (auctionSelect.value == "" || auctionSelect.value == null) {
          auctionSelect.setErrors({ required: true })
        } else {
          if (auctionSelect.hasError("required"))
            delete auctionSelect.errors!["required"];
        }
      }

    }
  }

  getControl(control: string) {
    return this.itemForm.controls[control]!;
  }

  formatAuctionDates(auction: Auction) {
    let start = new Date(auction.startDate);
    let end = new Date(auction.endDate);

    let formattedStart = start.toLocaleDateString('en-us', { year: 'numeric', month: 'short', day: 'numeric' });
    let formattedEnd = end.toLocaleDateString('en-us', { year: 'numeric', month: 'short', day: 'numeric' });
    const options = { year: 'numeric', month: 'short', day: 'numeric' };

    return `${formattedStart} - ${formattedEnd}`
  }
}
