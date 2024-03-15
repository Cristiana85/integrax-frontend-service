import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-auth-re-password',
  templateUrl: './auth-re-password.component.html',
  styleUrls: ['./auth-re-password.component.css']
})

/**
 * Auth RePassword Component
 */
export class AuthRePasswordComponent implements OnInit {

  year = new Date().getFullYear()
  constructor() { }

  ngOnInit(): void {
  }

}
