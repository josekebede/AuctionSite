import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ServiceService } from '../services/service.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {


  register = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.minLength(2)]),
    lastName: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    companyID: new FormControl('', Validators.required),
  })
  constructor(private service: ServiceService) { }

  ngOnInit(): void {
  }

  submit(form: HTMLFormElement) {
    this.register.markAllAsTouched();
    if (this.register.valid)
      this.service.register(this.register.value)
  }

  hasError(control: string, error?: string, notError?: string) {
    if (notError != undefined) {
      return this.register.controls[control].touched &&
        this.register.controls[control].hasError(error!) &&
        !this.register.controls[control].hasError(notError)
    } else {
      if (error != undefined)
        return this.register.controls[control].touched &&
          this.register.controls[control]!.hasError(error);
      else
        return this.register.controls[control].touched &&
          !this.register.controls[control].valid;
    }
  }

}
