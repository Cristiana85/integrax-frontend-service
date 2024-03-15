import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-bs-signup',
  templateUrl: './auth-bs-signup.component.html',
  styleUrls: ['./auth-bs-signup.component.css']
})
export class AuthBsSignupComponent {
  year = new Date().getFullYear()
}
