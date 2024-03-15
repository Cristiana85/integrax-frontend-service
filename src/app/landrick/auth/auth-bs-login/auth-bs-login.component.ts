import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-bs-login',
  templateUrl: './auth-bs-login.component.html',
  styleUrls: ['./auth-bs-login.component.css']
})
export class AuthBsLoginComponent {
  year = new Date().getFullYear()
}
