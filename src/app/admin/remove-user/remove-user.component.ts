import { ServiceService } from 'src/app/services/service.service';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/users';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';

@Component({
  selector: 'app-remove-user',
  templateUrl: './remove-user.component.html',
  styleUrls: ['./remove-user.component.scss']
})
export class RemoveUserComponent implements OnInit {

  delForm: FormGroup;
  _itemFormInitState = {};

  userList: User[] = [];
  userListSub: Subscription;
  deletedUserSub: Subscription;
  constructor(private service: ServiceService) {
    this.userListSub = this.service.getUsersList().subscribe(
      data => {
        this.userList = data;
      }
    )

    this.delForm = new FormGroup({
      userID: new FormControl('', Validators.required)
    });

    this.deletedUserSub = this.service.getDeletedUser().subscribe(
      data => {
        for (let i = 0; i < this.userList.length; i++) {
          if (this.userList[i]._id == data)
            this.userList.splice(i, 1)
        }
        this.service.popup(`User was deleted`)
      }
    )
  }

  ngOnInit(): void {
    this.service.fetchUsersList()
  }

  getFullValue(user: User) {
    return `${user.firstName} ${user.lastName} - CID(${user.companyID})`;
  }

  onSubmit(formDirective: FormGroupDirective, form: HTMLFormElement) {
    if (!this.userList.length) {
      this.service.popup("No Users to Delete", true);
      return;
    }
    if (this.delForm.valid) {
      if (window.confirm("Are you sure you want to delete this user?")) {
        this.service.deleteUser(this.delForm.value.userID);
        formDirective.resetForm(this._itemFormInitState);
        form.reset();
      }
    }
    // if (this.catForm.valid) {
    //   let category = this.catForm.get('category')!.value;
    //   if (window.confirm(`Are you sure you want to delete ${category}?`)) {
    //     this.service.deleteCategory(category)
    //     formDirective.resetForm(this._itemFormInitState);
    //     form.reset();
    //   }
    // }

  }
}
