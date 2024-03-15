import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-re-password',
  templateUrl: './re-password.component.html',
  styleUrls: ['./re-password.component.css']
})

/**
 * Auth RePassword-three Component
 */
export class RePasswordComponent implements OnInit {

  Settingicon = true;
  Menuoption = 'center'

  form!: FormGroup;
  loading = false;
  submitted = false;

  isLoggedin?: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    //private alertService: AlertService,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    /*this.socialAuthService.authState
    .subscribe({
      next: (user) => {

        this.socialUser = user;
        this.isLoggedin = user != null;
        console.log(this.socialUser);

        // get return url from query parameters or default to home page
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: error => {
        this.alertService.error(error);
        this.loading = false;
      }
    });*/
  }

  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    //this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.accountService.forgotPassword(this.f.email.value, this.f.email.value)
      .pipe(first())
      .subscribe({
        next: (ret) => {
          if (ret.successful){
            //this.alertService.success(ret.message, { keepAfterRouteChange: true });
            this.loading = false;
          } else {
            //this.alertService.error(ret.message);
            this.loading = false;
          }
        },
      });
  }
}
