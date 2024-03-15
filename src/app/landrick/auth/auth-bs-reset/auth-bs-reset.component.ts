import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-bs-reset',
  templateUrl: './auth-bs-reset.component.html',
  styleUrls: ['./auth-bs-reset.component.css']
})
export class AuthBsResetComponent {
  year = new Date().getFullYear()
}
