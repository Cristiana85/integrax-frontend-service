import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LightboxModule } from 'ngx-lightbox';

import { GoogleLoginProvider, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { NgbModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { FlatpickrModule } from 'angularx-flatpickr';
import { CountUpModule } from 'ngx-countup';
import { NgxEchartsModule, provideEcharts } from 'ngx-echarts';
import { NgxMasonryModule } from 'ngx-masonry';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { NgxTypedJsModule } from 'ngx-typed-js';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NgScrollbarModule } from 'ngx-scrollbar';

import { SimplebarAngularModule } from 'simplebar-angular';


import { SharedModule } from "./landrick/shared/shared.module";

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { FeatherModule } from 'angular-feather';

// Apex chart
import { NgApexchartsModule } from 'ng-apexcharts';

import { allIcons } from 'angular-feather/icons';
import { RePasswordComponent } from './landing-page/auth/re-password/re-password.component';
import { SigninComponent } from './landing-page/auth/signin/signin.component';
import { SignupComponent } from './landing-page/auth/signup/signup.component';
import { CorporatePricingComponent } from './landing-page/core/components/corporate-pricing/corporate-pricing.component';
import { HeaderComponent } from './landing-page/core/components/header/header.component';
import { IndexComponent } from './landing-page/core/components/index/index.component';
import { AuthBsLoginComponent } from './landrick/auth/auth-bs-login/auth-bs-login.component';
import { AuthBsResetComponent } from './landrick/auth/auth-bs-reset/auth-bs-reset.component';
import { AuthBsSignupComponent } from './landrick/auth/auth-bs-signup/auth-bs-signup.component';
import { AuthCoverLoginComponent } from './landrick/auth/auth-cover-login/auth-cover-login.component';
import { AuthCoverRePasswordComponent } from './landrick/auth/auth-cover-re-password/auth-cover-re-password.component';
import { AuthCoverSignupComponent } from './landrick/auth/auth-cover-signup/auth-cover-signup.component';
import { AuthLoginBgVideoComponent } from './landrick/auth/auth-login-bg-video/auth-login-bg-video.component';
import { AuthLoginComponent } from './landrick/auth/auth-login/auth-login.component';
import { AuthRePasswordComponent } from './landrick/auth/auth-re-password/auth-re-password.component';
import { AuthResetPasswordBgVideoComponent } from './landrick/auth/auth-reset-password-bg-video/auth-reset-password-bg-video.component';
import { AuthSignupBgVideoComponent } from './landrick/auth/auth-signup-bg-video/auth-signup-bg-video.component';
import { AuthSignupComponent } from './landrick/auth/auth-signup/auth-signup.component';
import { LoginComponent } from './landrick/auth/login/login.component';
import { RegistrationComponent } from './landrick/auth/registration/registration.component';
import { EmailAlertComponent } from './landrick/email/email-alert/email-alert.component';
import { EmailConfirmationComponent } from './landrick/email/email-confirmation/email-confirmation.component';
import { EmailInvoiceComponent } from './landrick/email/email-invoice/email-invoice.component';
import { EmailPasswordResetComponent } from './landrick/email/email-password-reset/email-password-reset.component';
import { FooterComponent } from './landrick/shared/footer/footer.component';
import { SwitcherComponent } from './landrick/shared/switcher/switcher.component';

import { DatePipe } from '@angular/common';
import { AlertComponent } from './components/old/alert/alert.component';
import { ErrorInterceptor } from './components/old/helpers/error.interceptor';
import { JwtInterceptor } from './components/old/helpers/jwt.interceptor';
import { ChPasswordComponent } from './landing-page/auth/ch-password/ch-password.component';
import { MasterPageComponent } from './landing-page/core/components/master-page/master-page.component';
import { WasmService } from './services/wasm.service';
import { TeamSpaceComponent } from './workspace/team-space/team-space.component';
import { MySpaceComponent } from './workspace/my-space/my-space.component';
import { WorkspaceFileManagerComponent } from './workspace/workspace-file-manager/workspace-file-manager.component';
import { WorkspaceFooterComponent } from './workspace/workspace-footer/workspace-footer.component';
import { WorkspaceHeaderComponent } from './workspace/workspace-header/workspace-header.component';
import { WorkspaceSidebarComponent } from './workspace/workspace-sidebar/workspace-sidebar.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { BudgetComponent } from './apps/budget/budget.component';
import { InterconnectComponent } from './apps/interconnect/interconnect.component';
import { MaterialModule } from './landrick/shared/material/material.module';
import { LibAvoidWasmService } from './services/wasm/libavoid/libavoid.wasm.service';
import { DiagramComponent } from './diagram/diagram.component';
import { EditorComponent } from './editor/editor.component';
import { ChartComponent } from './chart/chart.component';
import { IntegraTestPanelComponent } from './editor/integra-test-panel/integra-test-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    RegistrationComponent,
    MasterPageComponent,
    AuthCoverLoginComponent,
    AuthCoverRePasswordComponent,
    AuthCoverSignupComponent,
    AuthLoginComponent,
    SigninComponent,
    AuthRePasswordComponent,
    RePasswordComponent,
    ChPasswordComponent,
    AuthSignupComponent,
    SignupComponent,
    EmailAlertComponent,
    EmailConfirmationComponent,
    EmailInvoiceComponent,
    EmailPasswordResetComponent,
    IndexComponent,
    SwitcherComponent,
    CorporatePricingComponent,
    AuthBsLoginComponent,
    AuthLoginBgVideoComponent,
    AuthBsSignupComponent,
    AuthSignupBgVideoComponent,
    AuthBsResetComponent,
    AuthResetPasswordBgVideoComponent,
    AlertComponent,
    //DASHBOARD Component
    WorkspaceComponent,
    WorkspaceSidebarComponent,
    WorkspaceHeaderComponent,
    WorkspaceFileManagerComponent,
    WorkspaceFooterComponent,
    TeamSpaceComponent,
    MySpaceComponent,
    BudgetComponent,
    InterconnectComponent,
    DiagramComponent,
    EditorComponent,
    ChartComponent,
    IntegraTestPanelComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    RouterModule,
    CarouselModule,
    FeatherModule.pick(allIcons),
    //ScrollToModule.forRoot(),
    RouterModule.forRoot([], {}),
    YouTubePlayerModule,
    NgbDropdownModule,
    CKEditorModule,
    NgbModule,
    NgbNavModule,
    FormsModule,
    ReactiveFormsModule,
    SlickCarouselModule,
    NgApexchartsModule,
    NgxTypedJsModule,
    FlatpickrModule.forRoot(),
    CountUpModule,
    NgxMasonryModule,
    LightboxModule,
    SharedModule,
    SimplebarAngularModule,
    HttpClientModule,
    AppRoutingModule,
    NgxEchartsModule,
    MaterialModule,
    NgScrollbarModule,
  ],
  exports: [
    FeatherModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [
    DatePipe,
    provideEcharts(),
    WasmService,
    LibAvoidWasmService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '663990587528-hmu2scpu3t5m3eablhkmb62uq57r1i8c.apps.googleusercontent.com'
            )
          }
        ],
        onError: (err) => {
          console.error(err);
        }
      } as SocialAuthServiceConfig,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
