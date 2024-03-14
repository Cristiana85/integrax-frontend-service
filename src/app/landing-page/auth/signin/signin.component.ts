import { GoogleLoginProvider, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';
import { AccountService } from '../../../services/account.service';
import { ProjectsService } from '../../../services/projects.service';
import { TokenStorageService } from '../../../services/token-storage.service';
import { WasmService } from '../../../services/wasm.service';
import { Project } from '../../../models/project';


@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})

/**
 * Signin Component
 */
export class SigninComponent implements OnInit {

  Settingicon = true;
  Menuoption = 'center'

  form!: FormGroup;
  loading = false;
  submitted = false;

  socialUser!: SocialUser;
  isLoggedin?: boolean;
  errors = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    //private alertService: AlertService,
    private socialAuthService: SocialAuthService,
    //private authService: SocialAuthService,
    private projectService: ProjectsService,
    private tokenStorage: TokenStorageService,
    private wasmService: WasmService
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    //**************TEST WASM **************************/
    this.wasmService.multiply(4, 3).subscribe((ret) => {
      console.log(ret)
    });

    this.wasmService.sum(4, 3).subscribe((ret) => {
      console.log(ret)
    });
    //**************TEST WASM **************************/
  }

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
    this.accountService.login(this.f['email'].value, this.f['password'].value)
      .pipe(first())
      .subscribe({
        next: (ret) => {
          if (ret.successful) {
            this.tokenStorage.saveToken(ret.content['token']);
            // get return url from query parameters or default to home page
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
            this.router.navigateByUrl(returnUrl);

            this.projectService.saveProject(this.tokenStorage.getToken() || '{}', new Project())
              .subscribe(x => {
              });

          } else {
            this.errors = true;
            //this.alertService.error(ret.message);
            this.loading = false;
          }
        },
      });


  }

  loginWithGoogle(): void {
    let ret = this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }
  logOut(): void {
    this.socialAuthService.signOut();
  }
}
