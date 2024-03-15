import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-auth-signup',
  templateUrl: './auth-signup.component.html',
  styleUrls: ['./auth-signup.component.css']
})

/**
 * Auth Signup Component
 */
export class AuthSignupComponent implements OnInit {

  year = new Date().getFullYear()
  constructor() { }

  ngOnInit(): void {
  }

}
