import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../services/account.service';
import { TokenStorageService } from '../../../services/token-storage.service';


@Component({
  selector: 'app-ch-password',
  templateUrl: './ch-password.component.html',
  styleUrls: ['./ch-password.component.css']
})

/**
 * Change Password Component
 */
export class ChPasswordComponent implements OnInit {

  Settingicon = true;
  Menuoption = 'center'

  form!: FormGroup;
  loading = false;
  submitted = false;

  isLoggedin?: boolean;
  token!: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    //private alertService: AlertService,
    private tokenStorage: TokenStorageService,
  ) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'];

    this.form = this.formBuilder.group({
      newPassword: ['', [Validators.required, Validators.maxLength(30), Validators.minLength(6)]],
      confirmPassword: ''
    },
      { validator: this.checkPasswords })
  }

  checkPasswords(group: FormGroup) {
    const newPassword = <FormControl>group.get('newPassword');
    const confirmPassword = <FormControl>group.get('confirmPassword');

    return newPassword.value === confirmPassword.value ? null : { 'mismatch': true };
  }

  get f() { return this.form.controls; }
  get newPassword() { return this.form.get('newPassword'); }
  get confirmPassword() { return this.form.get('confirmPassword'); }


  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    //this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.accountService.resetPassword(this.token, this.f['newPassword'].value)
      .subscribe(ret => {
        if (ret.successful) {
          this.tokenStorage.saveToken(ret.content['token']);
          //this.alertService.success(ret.message, { keepAfterRouteChange: true });
          this.router.navigate(['../signin'], { relativeTo: this.route });
        } else {
          //this.alertService.error(ret.message);
          this.loading = false;
        }
      });
    this.loading = true;
  }
}
