import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-auth-cover-login',
  templateUrl: './auth-cover-login.component.html',
  styleUrls: ['./auth-cover-login.component.css']
})

/**
 * Auth Cover-Login Component
 */
export class AuthCoverLoginComponent implements OnInit {
  year = new Date().getFullYear()
  constructor() { }

  ngOnInit(): void {
  }

}
