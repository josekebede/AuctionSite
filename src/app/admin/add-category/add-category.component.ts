import { ServiceService } from 'src/app/services/service.service';
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent implements OnInit {

  categoryForm: FormGroup;
  _itemFormInitState = {};
  constructor(private service: ServiceService) {
    this.categoryForm = new FormGroup({
      category: new FormControl('', Validators.required)
    })
    this._itemFormInitState = this.categoryForm.value;
  }

  ngOnInit(): void {
  }
  onSubmit(formDirective: FormGroupDirective, form: HTMLFormElement) {
    if (this.categoryForm.valid) {
      let category = this.categoryForm.get('category')!.value;
      if (window.confirm(`Are you sure you want to add ${category}?`)) {
        this.service.addCategory(category)
        formDirective.resetForm(this._itemFormInitState);
        form.reset();
      }
    }
  }
}
