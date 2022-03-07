import { SpecialItem } from './../models/specialItem';
import { FormGroup } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Furniture, Item } from '../models/items';
import { Auction } from '../models/auction';
import { Bid } from '../models/bids';
import { Wishlist } from '../models/wishlist';
import { User } from '../models/users';
import { Slip } from '../models/slip';
import { Notification } from '../models/notification';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  private backendURL = "http://localhost:5000/"
  private loginCorrectUser = new Subject<boolean>();
  private categories = new Subject<string[]>();
  private items = new Subject<Item[] | []>();
  private sidenavToggle = new Subject();
  private changeSidenavState = new Subject<boolean>();
  private auctions = new Subject<Auction[]>();
  private auctionItems = new Subject<any>();
  private selectedCategory = new Subject<string>();
  public selectedCategoryValue = "";
  private bidSuccessful = new Subject<string>();
  private bids = new Subject<Bid[]>();
  private deletedItem = new Subject<string>();
  private wishList = new Subject<Wishlist>();
  private popupListner = new Subject<{ message: string | string[], error: boolean }>();
  private wishlistSubject = new Subject<string>();
  private deletedAuction = new Subject<string>();
  private deletedItemAdmin = new Subject<string>();
  private unverifiedUsers = new Subject<User[]>();
  private userVerified = new Subject<string>();
  private userRejected = new Subject<string>();
  private proofSent = new Subject<string>();
  private slips = new Subject<Slip[]>();
  private slipVerified = new Subject<{ slipID: string, status: boolean }>();
  private notificationCounter = new Subject<number>();
  private notificationList = new Subject<Notification[]>();
  private notificationSeen = new Subject<boolean>();
  private specialItems = new Subject<SpecialItem[]>();
  private deletedCategory = new Subject<string>();
  private users = new Subject<User[]>();
  private deletedUser = new Subject<string>();
  private routesThatRequireToken = ['vehicle', 'office', 'stock', 'admin', 'auctionItems'];

  private furnitures = new Subject<[Furniture]>();

  constructor(private httpClient: HttpClient, private router: Router) {

  }

  getDeletedUser() {
    return this.deletedUser.asObservable();
  }
  getUsersList() {
    return this.users.asObservable();
  }
  getDeletedCategory() {
    return this.deletedCategory.asObservable();
  }
  getSpecialItems() {
    return this.specialItems.asObservable();
  }
  getNotificationSeen() {
    return this.notificationSeen.asObservable();
  }
  getNotifications() {
    return this.notificationList.asObservable();
  }
  getNotificationCounter() {
    return this.notificationCounter.asObservable();
  }
  getSlipStatus() {
    return this.slipVerified.asObservable();
  }
  getSlips() {
    return this.slips.asObservable();
  }
  getProof() {
    return this.proofSent.asObservable();
  }
  getVerifiedUser() {
    return this.userVerified.asObservable();
  }
  getRejectedUser() {
    return this.userRejected.asObservable();
  }
  getUnverifiedUsers() {
    return this.unverifiedUsers.asObservable();
  }
  getDeletedItemAdmin() {
    return this.deletedItemAdmin.asObservable();
  }
  getDeletedAuction() {
    return this.deletedAuction.asObservable();
  }
  getWishlistListner() {
    return this.wishlistSubject.asObservable();
  }

  getPopupListner() {
    return this.popupListner.asObservable();
  }
  getWishlist() {
    return this.wishList.asObservable();
  }

  getDeletedItem() {
    return this.deletedItem.asObservable();
  }
  getBids() {
    return this.bids.asObservable();
  }
  getSuccessfulBid() {
    return this.bidSuccessful.asObservable();
  }
  getSelectedCategory() {
    return this.selectedCategory.asObservable();
  }
  getAuctionItems() {
    return this.auctionItems.asObservable();
  }
  getAuctions() {
    return this.auctions.asObservable();
  }

  getFurniture() {
    return this.furnitures.asObservable();
  }
  getSidenavToggle() {
    return this.sidenavToggle.asObservable();
  }

  getChangeSidenavState() {
    return this.changeSidenavState.asObservable();
  }

  toggleSidenav() {
    this.sidenavToggle.next(null);
  }

  getItems() {
    return this.items.asObservable();
  }

  getCategories() {
    return this.categories.asObservable();
  }

  setItems(items: Item[] | []) {
    this.items.next(items)
  }
  setCategories(categories: string[]) {
    this.categories.next([...categories]);
  }

  setSelectedCategory(category: string) {
    this.selectedCategoryValue = category;
    this.selectedCategory.next(category);
  }
  setSidenav(state: boolean) {
    this.changeSidenavState.next(state)
  }

  fetchCategories() {
    this.checkRouteForToken(); // Checks the route if an authentication token is required

    // Creates a token header
    let headers = this.createTokenHeader();
    if (headers)
      // Sends a get request that returns an array of strings
      this.httpClient.get<string[]>(this.backendURL + "fetch/categories", { headers: headers }).subscribe(
        // This occurs if the return status is successful
        (data) => {
          this.setCategories(data);
        },
        // This occurs if the return status is not a success message
        (error) => {
          console.log(headers)

          console.log(error)
          this.router.navigate(["/login"])
        }
      )
    else {
      this.router.navigate(["/login"])
    }
  }


  fetchAuctions() {
    let authHeader = this.createTokenHeader();
    if (authHeader) {
      this.httpClient.get<Auction[]>(this.backendURL + "fetch/auctionDates", { headers: authHeader }).subscribe(
        data => {
          this.auctions.next(data)
        },
        error => {
          console.log(error);
          this.router.navigate(["/login"])
        }
      )
    } else {
      this.router.navigate(["/login"])
    }
  }

  getLoginCorrect() {
    return this.loginCorrectUser.asObservable();
  }


  login(email: string, password: string) {
    const body = {
      email: email,
      password: password,
    }
    // This sends a post requeset to the server to get the auth token and type of user
    this.httpClient.post<any>(this.backendURL + "auth/login", body).subscribe(
      data => {
        // Saves the token to the local storage
        localStorage.setItem("token", data.token)
        // Saves the type to the local storage
        localStorage.setItem("type", data.type)
        // Saves the name to the local storage
        localStorage.setItem("name", data.fullName);
        // If the type is a user it navigates to auctionItems page
        if (data.type == 'user') {
          this.router.navigate(['/auctionItems']);
        }
        else if (data.type == 'admin') {
          // If the type is a admin it navigates to add item page
          this.router.navigate(['/admin/dashboard'])
        }
        this.loginCorrectUser.next(true)
      },
      // If there is an error message, it shows an error
      (error: HttpErrorResponse) => {
        if (error.status == 403) {
          if (error.error.errorCode == 1)
            this.popup("Not Verified. Please Contact Admin")
          else
            this.popup("Verification Not Approved. Please Register Again")
        }
        else
          this.loginCorrectUser.next(false)
      }
    )
  }

  logOut() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
  // This registers the user
  register(formData: object) {
    // Sends a registration request to the backend
    this.httpClient.post<{ type: string }>(this.backendURL + "auth/register", formData).subscribe(
      data => {
        if (data.type == "REGISTER")
          this.popup("Registration Complete")
        else
          this.popup("Registration Updated")
        // Client Successfully registers and redirects to login
        this.router.navigate(['/login']);
      },
      // If there is an error, it must be if the email is already taken
      error => {
        this.popup("This email is already in use", true);
      }
    )
  }

  // Adds a new item for auction
  addItem(formData: FormGroup, newAuction: boolean) {
    // Creates an auth header
    const authHeader = this.createTokenHeader();
    if (authHeader) {
      let data = new FormData();
      data.append("title", formData.value.title);
      data.append("type", formData.value.type);
      data.append("initialBid", formData.value.initialBid);
      data.append("picture", formData.value.picture);
      data.append("newAuction", newAuction ? "1" : "0");
      data.append("auctionSelect", formData.value.auctionSelect);
      data.append("auctionStart", formData.value.auctionStart);
      data.append("auctionEnd", formData.value.auctionEnd);

      // Sends a post request to the backend
      this.httpClient.post<{ message: string }>(this.backendURL + "auction/add", data, { headers: authHeader }).subscribe(
        data => {
          console.log(data)
          this.fetchAuctions();
        },
        (error: HttpErrorResponse) => {
          // If there is an error, it redirects to the login
          if (error.status == 403)
            this.popup("Incorrect Date. Please enter a correct date", true)
          console.log(error);
          // this.router.navigate(["/login"])
        }
      )
    }
  }

  fetchAuctionItems() {
    const authHeader = this.createTokenHeader();
    if (authHeader) {
      this.httpClient.get<any>(this.backendURL + "fetch/auctionsLive", { headers: authHeader }).subscribe(
        data => {
          this.auctionItems.next(data)
        }, error => {
          console.log(error);
          this.router.navigate(["/login"])
        }
      )
    } else {
      this.router.navigate(["/login"])
    }
  }

  fetchAllAuctionItems() {
    const authHeader = this.createTokenHeader();
    if (authHeader) {
      this.httpClient.get<any>(this.backendURL + "fetch/auctionsAll", { headers: authHeader }).subscribe(
        data => {
          data.forEach((auction: any, index: number) => {
            for (let i = 0; i < data[index].items.length; i++) {
              // data[index].items.toObject();
              data[index].items[i].wishlist = false;
            }
          });
          this.auctionItems.next(data)
        }, error => {
          console.log(error);
          this.router.navigate(["/login"])
        }
      )
    } else {
      this.router.navigate(["/login"])
    }
  }
  // Fetches all the items
  fetchItems(type: string) {
    const authHeader = this.createTokenHeader();
    if (authHeader) {
      this.httpClient.post<Item[] | []>(this.backendURL + "fetchItems", { type: type }, { headers: authHeader }).subscribe(
        data => {
          this.setItems(data)
        },
        error => {
          console.log(error);
          this.router.navigate(["/login"])
        }
      )
    }
  }

  fetchSpecialItems() {
    let authHeader = this.createTokenHeader();

    if (authHeader) {
      this.httpClient.get<SpecialItem[]>(this.backendURL + "fetch/specialAuction", { headers: authHeader }).subscribe(
        data => {
          this.specialItems.next(data);
        }, error => {
          this.router.navigate(["/login"])
        }
      )
    } else {
      this.router.navigate(["/login"])
    }
  }

  bidItem(bid: object) {
    let authHeader = this.createTokenHeader();

    if (authHeader) {
      this.httpClient.post<{ message: string }>(this.backendURL + "auction/bid", bid, { headers: authHeader }).subscribe(
        data => {
          console.log(data)
          this.bidSuccessful.next(data.message);
        }, error => {
          this.router.navigate(["/login"])
        }
      )
    } else {
      this.router.navigate(["/login"])
    }
  }

  deleteBid(bidID: string) {
    let authHeader = this.createTokenHeader();
    if (authHeader) {
      this.httpClient.post<string>(this.backendURL + "auction/deleteBid", { bidID: bidID }, { headers: authHeader }).subscribe(
        data => {
          this.deletedItem.next(data)
        }, error => {
          console.log(error)
        }
      )
    } else {
      this.router.navigate(["/login"])
    }
  }


  // Fetches the furniture
  fetchBids() {
    const authHeader = this.createTokenHeader();
    if (authHeader) {
      this.httpClient.get<Bid[]>(this.backendURL + "fetch/bids", { headers: authHeader }).subscribe(
        data => {
          this.bids.next(data);
        }, error => {
          console.log(error);
          this.router.navigate(["/login"])
        }
      )
    } else {
      this.router.navigate(["/login"])
    }
  }

  sendBidProof(formData: FormGroup, bidID: string) {

    // console.log(formData.valid)
    const authHeader = this.createTokenHeader();
    if (authHeader) {
      let data = new FormData();
      data.append("proofImage", formData.value.proofImage);
      data.append("bidID", bidID)

      this.httpClient.post<any>(this.backendURL + 'auction/bidProof', data, { headers: authHeader }).subscribe(
        data => {
          this.proofSent.next(data)
        }, error => {
          console.log(error)
          this.router.navigate(["/login"])
        }
      )

    } else {
      this.router.navigate(["/login"])
    }
  }

  addItemToWishlist(itemCode: string) {
    const authHeader = this.createTokenHeader();
    if (authHeader) {
      this.httpClient.post<{ message: string, itemCode: string }>(this.backendURL + "auction/addWish", { itemCode: itemCode }, { headers: authHeader }).subscribe(
        data => {
          this.wishlistSubject.next(data.itemCode)
          this.popup(data.message)
        }, error => {
          console.log(error)
        }
      )
    } else {
      this.router.navigate(["/login"]);
    }
  }

  deleteWishlistItem(itemCode: string) {
    let authHeader = this.createTokenHeader();
    if (authHeader) {
      this.httpClient.post<string>(this.backendURL + "auction/deleteWish", { itemCode: itemCode }, { headers: authHeader }).subscribe(
        data => {
          this.deletedItem.next(data)
        }, error => {
          console.log(error)
        }
      )
    } else {
      this.router.navigate(["/login"])
    }
  }

  fetchWishlist() {
    const authHeader = this.createTokenHeader();
    if (authHeader) {
      this.httpClient.get<Wishlist>(this.backendURL + "fetch/wishlist", { headers: authHeader }).subscribe(
        data => {
          this.wishList.next(data)
        }, error => {
          console.log(error)
        }
      )
    } else {
      this.router.navigate(["/login"]);
    }
  }


  popup(message: string | string[], error?: boolean) {
    if (error)
      this.popupListner.next({ message: message, error: true });
    else
      this.popupListner.next({ message: message, error: false });
  }

  uploadFile(formGroup: FormGroup) {
    let formData = new FormData();
    formData.append("file", formGroup.value.file)

    let authHeader = this.createTokenHeader();
    if (authHeader) {
      this.httpClient.post<string | string[]>(this.backendURL + "auction/addFile", formData, { headers: authHeader }).subscribe(
        data => {
          this.popup(data)
          console.log(data)
        }, error => {
          this.popup(error.error, true)
          console.log(error)
        }
      )
    } else {
      this.router.navigate(["/login"]);
    }
  }

  deleteAuction(auctionID: string) {
    let authHeader = this.createTokenHeader();
    if (authHeader) {
      this.httpClient.post<string>(this.backendURL + "auction/deleteAuction", { auctionID: auctionID }, { headers: authHeader }).subscribe(
        data => {
          this.deletedAuction.next(data);
        }, error => {
          console.log(error)
        }
      )
    } else {
      this.router.navigate(['/login'])
    }
  }

  deleteItemAdmin(itemCode: string) {
    let authHeader = this.createTokenHeader();
    if (authHeader) {
      this.httpClient.post<string>(this.backendURL + "auction/deleteItem", { itemCode: itemCode }, { headers: authHeader }).subscribe(
        data => {
          this.deletedItemAdmin.next(data);
        }, error => {
          console.log(error)
        }
      )
    } else {
      this.router.navigate(['/login'])
    }
  }

  fetchUnverifiedUsers() {
    let authHeader = this.createTokenHeader();
    if (authHeader) {
      this.httpClient.get<User[]>(this.backendURL + "fetch/usersList", { headers: authHeader }).subscribe(
        data => {
          this.unverifiedUsers.next(data)
        }
      )
    } else {
      this.router.navigate(['/login'])
    }
  }

  fetchSlips() {
    let authHeader = this.createTokenHeader();
    if (authHeader) {
      this.httpClient.get<Slip[]>(this.backendURL + "fetch/slipList", { headers: authHeader }).subscribe(
        data => {
          this.slips.next(data)
        }
      )
    } else {
      this.router.navigate(['/login'])
    }
  }

  verifyUser(userID: string) {
    let authHeader = this.createTokenHeader();
    if (authHeader) {
      this.httpClient.post<string>(this.backendURL + "verify/user", { userID: userID }, { headers: authHeader }).subscribe(
        data => {
          this.userVerified.next(data)
        }, error => {
          console.log(error)
        }
      )
    } else {
      this.router.navigate(['/login'])
    }
  }

  rejectUser(userID: string) {
    let authHeader = this.createTokenHeader();
    if (authHeader) {
      this.httpClient.post<string>(this.backendURL + "verify/userReject", { userID: userID }, { headers: authHeader }).subscribe(
        data => {
          this.userRejected.next(data)
        }, error => {
          console.log(error)
        }
      )
    } else {
      this.router.navigate(["/login"])
    }
  }

  verifySlip(bidID: string) {
    let authHeader = this.createTokenHeader();
    if (authHeader) {
      this.httpClient.post<string>(this.backendURL + "verify/slipAccept", { bidID: bidID }, { headers: authHeader }).subscribe(
        data => {
          this.slipVerified.next({ slipID: data, status: true })
        }, error => {
          console.log(error)
        }
      )
    } else {
      this.router.navigate(['/login'])
    }
  }

  rejectSlip(bidID: string) {
    let authHeader = this.createTokenHeader();
    if (authHeader) {
      this.httpClient.post<string>(this.backendURL + "verify/slipReject", { bidID: bidID }, { headers: authHeader }).subscribe(
        data => {
          this.slipVerified.next({ slipID: data, status: false })
        }, error => {
          console.log(error)
        }
      )
    } else {
      this.router.navigate(['/login'])
    }
  }

  fetchNotificationCounter() {
    let authHeader = this.createTokenHeader();
    if (authHeader) {
      this.httpClient.get<number>(this.backendURL + "fetch/notificationCount", { headers: authHeader }).subscribe(
        data => {
          this.notificationCounter.next(data)
        }, error => {
          console.log(error)
        }
      )
    } else {
      this.router.navigate(['/login'])
    }
  }
  fetchNotifications() {
    let authHeader = this.createTokenHeader();
    if (authHeader) {
      this.httpClient.get<Notification[]>(this.backendURL + "fetch/notifications", { headers: authHeader }).subscribe(
        data => {
          this.notificationList.next(data)
        }, error => {
          console.log(error)
        }
      )
    } else {
      this.router.navigate(['/login'])
    }
  }

  setNotificationSeen() {
    let authHeader = this.createTokenHeader();
    if (authHeader) {
      this.httpClient.get<boolean>(this.backendURL + "verify/seen", { headers: authHeader }).subscribe(
        data => {
          this.notificationSeen.next(data)
        }, error => {
          console.log(error)
        }
      )
    } else {
      this.router.navigate(['/login'])
    }
  }

  addCategory(category: string) {
    let authHeader = this.createTokenHeader();
    if (authHeader) {
      this.httpClient.post<string>(this.backendURL + "auction/addCategory", { category: category }, { headers: authHeader }).subscribe(
        data => {
          this.popup(`${data} has been added`)
          // this.notificationSeen.next(data)
        }, (error: HttpErrorResponse) => {
          this.popup(`${error.error} already exists`, true)
        }
      )
    } else {
      this.router.navigate(['/login'])
    }
  }

  deleteCategory(categoryName: string) {
    let authHeader = this.createTokenHeader();
    if (authHeader) {
      this.httpClient.post<string>(this.backendURL + "auction/deleteCategory", { categoryName: categoryName }, { headers: authHeader }).subscribe(
        data => {
          this.deletedCategory.next(data)
          this.popup(`${data} has been deleted`)
        }, (error: HttpErrorResponse) => {
          console.log(error)
          this.popup(error.error, true)
        }
      )
    } else {
      this.router.navigate(['/login'])
    }
  }

  fetchUsersList() {
    let authHeader = this.createTokenHeader();
    if (authHeader) {
      this.httpClient.get<User[]>(this.backendURL + "fetch/usersListVerified", { headers: authHeader }).subscribe(
        data => {
          this.users.next(data)
        }, error => {
          console.log(error)
        }
      )
    } else {
      this.router.navigate(['/login'])
    }
  }

  deleteUser(userID: string) {
    let authHeader = this.createTokenHeader();
    if (authHeader) {
      this.httpClient.post<string>(this.backendURL + "auction/deleteUser", { userID: userID }, { headers: authHeader }).subscribe(
        data => {
          this.deletedUser.next(data)
        }, error => {
          console.log(error)
        }
      )
    } else {
      this.router.navigate(['/login'])
    }
  }
  // Checks the local storage if the type of the logged in person is admin
  checkIfAdmin() {
    this.checkRouteForToken();
    const type = localStorage.getItem("type");
    return type == "admin";
  }

  // Checks the local storage if the type of the logged in person is user
  checkIfUesr() {
    this.checkRouteForToken();
    const type = localStorage.getItem("type");
    return type == "user";
  }

  checkRouteForToken() {
    const url = this.router.url.split("/")[1];
    if (this.routesThatRequireToken.includes(url)) {
      const token = localStorage.getItem("token");
      if (!token) {
        this.router.navigateByUrl("/login");
      }
    }
  }

  checkIfLoggedIn() {
    const token = localStorage.getItem("token");
    return (token != null)
  }
  createTokenHeader() {
    const token = localStorage.getItem("token");
    if (token)
      return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
    else
      return null;
  }
}
