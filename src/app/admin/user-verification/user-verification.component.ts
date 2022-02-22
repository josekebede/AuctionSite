import { ServiceService } from 'src/app/services/service.service';
import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from 'src/app/models/users';

@Component({
  selector: 'app-user-verification',
  templateUrl: './user-verification.component.html',
  styleUrls: ['./user-verification.component.scss']
})
export class UserVerificationComponent implements OnInit, OnDestroy {

  users: User[] = [];
  unverifiedUsersSub: Subscription;
  userVerified: Subscription;
  userRejected: Subscription;
  constructor(private service: ServiceService) {
    this.unverifiedUsersSub = this.service.getUnverifiedUsers().subscribe(
      data => {
        this.users = data;
      }
    )

    this.userVerified = this.service.getVerifiedUser().subscribe(
      data => {
        for (let i = 0; i < this.users.length; i++) {
          if (this.users[i]._id == data)
            this.users.splice(i, 1);
        }
        this.service.popup("User Verified")
      }
    )
    this.userRejected = this.service.getRejectedUser().subscribe(
      data => {
        for (let i = 0; i < this.users.length; i++) {
          if (this.users[i]._id == data)
            this.users.splice(i, 1);
        }
        this.service.popup("User Rejected", true)
      }
    )
  }

  verifyUser(id: string, fullName: string) {

    if (window.confirm(`Are you sure you want to verify ${fullName}?`))
      this.service.verifyUser(id)
  }

  rejectUser(id: string, fullName: string) {
    if (window.confirm(`Are you sure you want to reject ${fullName}?`))
      this.service.rejectUser(id)
  }
  ngOnInit(): void {
    this.service.fetchUnverifiedUsers();
  }

  ngOnDestroy(): void {
    this.unverifiedUsersSub.unsubscribe();
    this.userVerified.unsubscribe()
  }
}
