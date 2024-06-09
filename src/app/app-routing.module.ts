import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditorComponent } from './editor/editor.component';
import { AuthGuard } from './landing-page/auth/auth.guard';
import { ChPasswordComponent } from './landing-page/auth/ch-password/ch-password.component';
import { RePasswordComponent } from './landing-page/auth/re-password/re-password.component';
import { SigninComponent } from './landing-page/auth/signin/signin.component';
import { SignupComponent } from './landing-page/auth/signup/signup.component';
import { CorporatePricingComponent } from './landing-page/core/components/corporate-pricing/corporate-pricing.component';
import { IndexComponent } from './landing-page/core/components/index/index.component';
import { MasterPageComponent } from './landing-page/core/components/master-page/master-page.component';
import { SwitcherComponent } from './landrick/shared/switcher/switcher.component';

const routes: Routes = [
  {
    path: '',
    component: MasterPageComponent,
    children: [
      { path: '', component: IndexComponent },
      { path: 'index', component: IndexComponent },
      { path: '#', component: SwitcherComponent },
      { path: 'corporate-pricing', component: CorporatePricingComponent },

      //USED
      { path: 'signin', component: SigninComponent },
      { path: 're-password', component: RePasswordComponent },
      { path: 'ch-password', component: ChPasswordComponent },
      { path: 'signup', component: SignupComponent },
    ],
  },

  /*{ path: 'auth-login', component: AuthLoginComponent },
  { path: 'auth-bs-login', component: AuthBsLoginComponent },
  { path: 'auth-login-bg-video', component: AuthLoginBgVideoComponent },
  { path: 'auth-cover-login', component: AuthCoverLoginComponent },
  { path: 'auth-cover-re-password', component: AuthCoverRePasswordComponent },
  { path: 'auth-cover-signup', component: AuthCoverSignupComponent },
  { path: 'auth-re-password', component: AuthRePasswordComponent },
  { path: 'auth-bs-reset', component: AuthBsResetComponent },
  { path: 'auth-reset-password-bg-video', component: AuthResetPasswordBgVideoComponent },
  { path: 'auth-bs-signup', component: AuthBsSignupComponent },
  { path: 'auth-signup-bg-video', component: AuthSignupBgVideoComponent },

  { path: 'email-alert', component: EmailAlertComponent },
  { path: 'email-confirmation', component: EmailConfirmationComponent },
  { path: 'email-invoice', component: EmailInvoiceComponent },
  { path: 'email-password-reset', component: EmailPasswordResetComponent },*/

  //Login
    { path: 'workspace', loadChildren: () => import('./workspace/workspace.module').then(m => m.WorkspaceModule), canActivate: [AuthGuard] },
    { path: 'editor', component: EditorComponent},
  ]
  ;

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
