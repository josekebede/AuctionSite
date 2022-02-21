import { ServiceService } from 'src/app/services/service.service';
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-multiple-items',
  templateUrl: './add-multiple-items.component.html',
  styleUrls: ['./add-multiple-items.component.scss']
})
export class AddMultipleItemsComponent implements OnInit {

  uploadForm: FormGroup;
  imageDirty = false;
  imageUploaded = false;
  imageURL = "";
  _itemFormInitState = {};

  constructor(private service: ServiceService) {
    this.uploadForm = new FormGroup({
      file: new FormControl('', Validators.required)
    })
    this._itemFormInitState = this.uploadForm.value;

  }

  ngOnInit(): void {
  }

  onSubmit(formDirective: FormGroupDirective, form: HTMLFormElement) {
    this.imageClicked();
    if (this.uploadForm.valid) {
      this.service.uploadFile(this.uploadForm); // Submits the form
      formDirective.resetForm(this._itemFormInitState);
      form.reset();
      this.resetImage();
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
    this.uploadForm.controls["file"].patchValue(null)
  }
  // This occurs when the dialog box (when the picture is clicked) has chosen a file or cancel is clicked
  imageChanged(event: Event) {
    const file = (event.target as HTMLInputElement).files![0];
    console.log(file)
    if (file) { // If an image is chosen
      this.imageUploaded = true;

      // The following steps are used to add the image to our form
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imageURL = String(reader.result)
        this.uploadForm.controls["file"].patchValue(file)
      };
    } else { // If no image is chosen
      this.imageUploaded = false;
      this.imageURL = ""
      this.uploadForm.controls["file"].patchValue(null)
    }
  }

}
