import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AccountService } from 'src/app/services/account.service';
import { ProjectsService } from 'src/app/services/projects.service';
import { TokenStorageService } from 'src/app/services/state.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})

/**
 * Auth Signup-three Component
 */
export class SignupComponent implements OnInit {

  Settingicon = true;
  Menuoption = 'center'

  form!: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    //private alertService: AlertService,
    private tokenStorage: TokenStorageService,
    private projectService: ProjectsService) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      //username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
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
    this.accountService.register(this.form.value)
      .pipe(first())
      .subscribe({
        next: (ret) => {
          if (ret.successful) {
            this.tokenStorage.saveToken(ret.content['token']);
            //this.alertService.success(ret.message, { keepAfterRouteChange: true });
            this.router.navigate(['../login'], { relativeTo: this.route });
          } else {
            //this.alertService.error(ret.message);
            this.loading = false;
          }
        },
      });
  }
}

