import { SlipVerficationComponent } from './admin/slip-verfication/slip-verfication.component';
import { NgModule } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms'
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginUserComponent } from './login/login-user/login-user.component';
import { RegistrationComponent } from './registration/registration.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';


import { HeaderComponent } from './header/header.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { HomeComponent } from './home/home.component';
import { FurnitureComponent } from './categories/furniture/furniture.component';
import { VehicleComponent } from './categories/vehicle/vehicle.component';
import { OfficeComponent } from './categories/office/office.component';
import { StockComponent } from './categories/stock/stock.component';
import { ItemComponent } from './item/item.component';
import { AddItemComponent } from './admin/add-item/add-item.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { ItemsListComponent } from './items-list/items-list.component';
import { BidsComponent } from './bids/bids.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { NotificationComponent } from './notification/notification.component';
import { PopupComponent } from './popup/popup.component';
import { AddMultipleItemsComponent } from './admin/add-multiple-items/add-multiple-items.component';
import { DashboardItemComponent } from './admin/dashboard/dashboard-item/dashboard-item.component';
import { UserVerificationComponent } from './admin/user-verification/user-verification.component';
import { SpecialBidsComponent } from './special-bids/special-bids.component';
import { AddCategoryComponent } from './admin/add-category/add-category.component';
import { DeleteCategoryComponent } from './admin/delete-category/delete-category.component';
import { RemoveUserComponent } from './admin/remove-user/remove-user.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginUserComponent,
    RegistrationComponent,
    HeaderComponent,
    NotFoundComponent,
    HomeComponent,
    FurnitureComponent,
    VehicleComponent,
    OfficeComponent,
    StockComponent,
    ItemComponent,
    AddItemComponent,
    DashboardComponent,
    ItemsListComponent,
    BidsComponent,
    WishlistComponent,
    NotificationComponent,
    PopupComponent,
    AddMultipleItemsComponent,
    DashboardItemComponent,
    UserVerificationComponent,
    SlipVerficationComponent,
    SpecialBidsComponent,
    AddCategoryComponent,
    DeleteCategoryComponent,
    RemoveUserComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatBadgeModule,
    MatButtonModule,
    MatDatepickerModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatNativeDateModule,
    MatToolbarModule,
    MatSelectModule,
    MatSidenavModule,
    MatTabsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
