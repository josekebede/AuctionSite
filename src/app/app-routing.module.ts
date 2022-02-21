import { RemoveUserComponent } from './admin/remove-user/remove-user.component';
import { DeleteCategoryComponent } from './admin/delete-category/delete-category.component';
import { AddCategoryComponent } from './admin/add-category/add-category.component';
import { SpecialBidsComponent } from './special-bids/special-bids.component';
import { SlipVerficationComponent } from './admin/slip-verfication/slip-verfication.component';
import { UserVerificationComponent } from './admin/user-verification/user-verification.component';
import { AddMultipleItemsComponent } from './admin/add-multiple-items/add-multiple-items.component';
import { NotificationComponent } from './notification/notification.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { BidsComponent } from './bids/bids.component';
import { ItemsListComponent } from './items-list/items-list.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { RegistrationComponent } from './registration/registration.component';
import { LoginUserComponent } from './login/login-user/login-user.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddItemComponent } from './admin/add-item/add-item.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginUserComponent
  },
  {
    path: 'registration',
    component: RegistrationComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'auctionItems',
    component: ItemsListComponent
  },
  {
    path: 'bids',
    component: BidsComponent
  },
  {
    path: 'wishlist',
    component: WishlistComponent
  },
  {
    path: 'notification',
    component: NotificationComponent
  },
  {
    path: 'specialItems',
    component: SpecialBidsComponent
  },
  {
    path: 'admin',
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'addItem',
        children: [
          {
            path: '',
            component: AddItemComponent
          },
          {
            path: 'upload',
            component: AddMultipleItemsComponent
          }
        ]
      },
      {
        path: 'verifyUser',
        component: UserVerificationComponent
      },
      {
        path: 'verifySlip',
        component: SlipVerficationComponent
      },
      {
        path: 'addCategory',
        component: AddCategoryComponent
      },
      {
        path: 'deleteCatgory',
        component: DeleteCategoryComponent
      },
      {
        path: 'deleteUser',
        component: RemoveUserComponent
      }
    ],
  },
  {
    path: '',
    redirectTo: 'home', pathMatch: 'full'
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
