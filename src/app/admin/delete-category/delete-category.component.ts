import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';
import { ServiceService } from 'src/app/services/service.service';
import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-delete-category',
  templateUrl: './delete-category.component.html',
  styleUrls: ['./delete-category.component.scss']
})
export class DeleteCategoryComponent implements OnInit {
  categoriesSub: Subscription;
  categoryDeletedSub: Subscription;
  categories: string[] = [];
  catForm: FormGroup;
  _itemFormInitState = {};
  constructor(private service: ServiceService) {
    this.catForm = new FormGroup({
      category: new FormControl('', Validators.required)
    })
    this._itemFormInitState = this.catForm.value;
    this.categoriesSub = this.service.getCategories().subscribe(
      data => {
        this.categories = data;
        console.log(this.categories)
      }
    )

    this.categoryDeletedSub = this.service.getDeletedCategory().subscribe(
      data => {
        for (let i = 0; i < this.categories.length; i++) {
          if (this.categories[i] == data)
            this.categories.splice(i, 1);
        }
      }
    )
  }

  ngOnInit(): void {
    this.service.fetchCategories();
  }
  onSubmit(formDirective: FormGroupDirective, form: HTMLFormElement) {
    if (this.catForm.valid) {
      if (!this.categories.length) {
        this.service.popup("No Categories to Delete", true);
        return;
      }
      let category = this.catForm.get('category')!.value;
      if (window.confirm(`Are you sure you want to delete ${category}?`)) {
        this.service.deleteCategory(category)
        formDirective.resetForm(this._itemFormInitState);
        form.reset();
      }
    }
  }
}
