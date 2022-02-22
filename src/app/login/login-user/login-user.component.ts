import { ServiceService } from './../../services/service.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login-user',
  templateUrl: './login-user.component.html',
  styleUrls: ['./login-user.component.scss']
})
export class LoginUserComponent implements OnInit, OnDestroy {
  hide = true;
  incorrectLogin = false;
  loginSub: Subscription;
  login = new FormGroup({
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  })
  constructor(public service: ServiceService) {
    this.loginSub = this.service.getLoginCorrect().subscribe(
      isLoginCorrect => {
        this.incorrectLogin = !isLoginCorrect;
      }
    )
  }

  ngOnInit(): void {
  }

  submit(form: HTMLFormElement) {
    if (this.login.valid) {
      this.service.login(this.login.value.email, this.login.value.password)
      form.reset();
    }
  }

  ngOnDestroy(): void {
    this.loginSub.unsubscribe();
  }

}
