import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-auth-cover-signup',
  templateUrl: './auth-cover-signup.component.html',
  styleUrls: ['./auth-cover-signup.component.css']
})

/**
 * Auth Cover-Signup Component
 */
export class AuthCoverSignupComponent implements OnInit {

  year = new Date().getFullYear()
  constructor() { }

  ngOnInit(): void {
  }

}
