import { Subscription } from 'rxjs';
import { ServiceService } from 'src/app/services/service.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Auction';
  currentSidenavState = false;
  isAdmin = false;
  categoriesSub: Subscription;
  categories: string[] = [];
  logInSub: Subscription;
  selectedCategory = "";

  fullName = "NO NAME";
  constructor(private service: ServiceService) {
    this.service.getSidenavToggle().subscribe(
      data => {
        this.currentSidenavState = !this.currentSidenavState;
      }
    )

    this.service.getChangeSidenavState().subscribe(
      data => {
        this.currentSidenavState = data;
      }
    );

    this.categoriesSub = this.service.getCategories().subscribe(
      data => {
        this.categories = data;
        if (data.length)
          this.categoryClick(data[0])
      }
    )

    this.logInSub = this.service.getLoginCorrect().subscribe(
      data => {
        if (data) {
          this.isAdmin = this.service.checkIfAdmin();
        }
      }
    );

    // if (this.service.checkIfLoggedIn()) {
    //   this.service.fetchCategories();
    // }
  }

  logOut() {
    this.service.logOut();
    this.currentSidenavState = false;
  }
  categoryClick(category: string) {
    this.service.setSelectedCategory(category);
    this.selectedCategory = category;
    // this.service.fetchItems(category);
  }

  checkIfAdmin() {
    let type = localStorage.getItem("type");
    if (type == "admin")
      return true;
    else
      return false
  }


  routeClick() {
    this.service.setSidenav(false);
  }
}
