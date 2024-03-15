import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { TokenStorageService } from '../../../../services/state.service';
import { AccountService } from '../../../../services/account.service';
import { AlertService } from '../../../../services/alert.service';

@Component({ templateUrl: 'change-password.component.html' })
export class ChangePasswordComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  submitted = false;

  isLoggedin?: boolean;
  token: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private alertService: AlertService,
    private tokenStorage: TokenStorageService
  ) {
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'];
    this.form = this.formBuilder.group({
      newPassword: ['', Validators.required/*Validators.compose([
        Validators.required,
        PasswordValidators.patternValidator(/\d/, { hasNumber: true }),
        PasswordValidators.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
        PasswordValidators.patternValidator(/[a-z]/, { hasSmallCase: true }),
        Validators.minLength(8)
      ])*/],
      confirmPassword: ['', Validators.required]
    }, {
      //validator: PasswordValidators.passwordsShouldMatch
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }
  get newPassword() { return this.form.get('newPassword'); }
  get confirmPassword() { return this.form.get('confirmPassword'); }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.accountService.resetPassword(this.token, this.f.newPassword.value)
      .subscribe(ret => {
        if (ret.successful) {
          this.tokenStorage.saveToken(ret.content['token']);
          this.alertService.success(ret.message, { keepAfterRouteChange: true });
          this.router.navigate(['../login'], { relativeTo: this.route });
        } else {
          this.alertService.error(ret.message);
          this.loading = false;
        }
      });
    this.loading = true;
  }
}
