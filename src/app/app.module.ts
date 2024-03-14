import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { GoogleLoginProvider, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';







// Apex chart

import { RePasswordComponent } from './landing-page/auth/re-password/re-password.component';
import { SigninComponent } from './landing-page/auth/signin/signin.component';
import { SignupComponent } from './landing-page/auth/signup/signup.component';

import { DatePipe } from '@angular/common';
import { ChPasswordComponent } from './landing-page/auth/ch-password/ch-password.component';
import { WasmService } from './services/wasm.service';
import { ErrorInterceptor } from './landing-page/auth/error.interceptor';
import { JwtInterceptor } from './landing-page/auth/jwt.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    SigninComponent,
    RePasswordComponent,
    ChPasswordComponent,
    SignupComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    RouterModule,
    RouterModule.forRoot([], {}),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [
    DatePipe,
    WasmService,
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
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
