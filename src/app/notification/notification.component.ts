import { ServiceService } from 'src/app/services/service.service';
import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Notification } from '../models/notification';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  notificationsSub: Subscription;
  notifications: Notification[] = [];
  constructor(private service: ServiceService) {
    this.notificationsSub = this.service.getNotifications().subscribe(
      data => {
        console.log(data.length)
        while (data.length) {
          let lastNotif = data.pop();
          if (lastNotif)
            this.notifications.push(lastNotif)
        }
        this.service.setNotificationSeen()
      }
    )
  }
  formatDate(date: Date) {
    let now = Date.now();
    date = new Date(date);
    // let diff = (now - date.getTime()) / 1000;
    let sameDay = (new Date(now)).getDay() == date.getDay()
    if (sameDay)
      return this.formatAMPM(date);
    else
      return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  formatAMPM(date: Date) {
    var hours = date.getHours();
    var minutes: string | number = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  ngOnInit(): void {
    this.service.fetchNotifications();
  }
  ngOnDestroy(): void {
    this.notificationsSub.unsubscribe();
  }
}
