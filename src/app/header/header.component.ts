import { ServiceService } from 'src/app/services/service.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  logInSub: Subscription;
  fullName = "NO NAME";
  notificationSub: Subscription;
  notificaitonSeen: Subscription;
  numberOfNotif = 0;
  constructor(private service: ServiceService, private router: Router) {
    this.logInSub = this.service.getLoginCorrect().subscribe(
      data => {
        if (data) this.setName();
        if (this.isUser())
          this.service.fetchNotificationCounter();
      })
    this.notificationSub = this.service.getNotificationCounter().subscribe(
      data => {
        console.log(data)
        this.numberOfNotif = data;
      }
    )

    this.notificaitonSeen = this.service.getNotificationSeen().subscribe(
      data => {
        this.numberOfNotif = 0;
      }
    )
    this.setName();
  }

  getNotifCounter() {
    if (this.numberOfNotif == 0)
      return null
    else
      return this.numberOfNotif;
  }
  setName() {
    let name = localStorage.getItem("name");
    if (name)
      this.fullName = name;
  }
  ngOnInit(): void {
    if (this.isUser())
      this.service.fetchNotificationCounter();
  }

  logOut() {
    this.service.logOut();
    this.service.setSidenav(false);
  }
  toggleSidenav() {
    this.service.toggleSidenav();
  }

  // This function checks if the current route is found in the routes that are passed as a parameter
  checkRoute(route: string[]) {
    return route.includes(this.router.url.split("/")[1]);
  }

  isAdmin() {
    let type = localStorage.getItem("type");
    if (type == "admin")
      return true;
    else
      return false
  }

  routeClick() {
    this.service.setSidenav(false);
  }

  isUser() {
    let type = localStorage.getItem("type");
    if (type == "user")
      return true;
    else
      return false
  }
}
