import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToggleService } from './dashboard-header/toggle.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  title = 'IntegraX - Angular 17 Material Design Admin Dashboard Template';

  isToggled = false;

  constructor(
    public router: Router,
    private toggleService: ToggleService,
  ) {
    this.toggleService.isToggled$.subscribe(isToggled => {
      this.isToggled = isToggled;
    });
  }
}

