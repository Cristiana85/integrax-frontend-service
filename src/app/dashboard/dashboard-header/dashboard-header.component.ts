import { Component, HostListener } from '@angular/core';
import { ToggleService } from './toggle.service';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-dashboard-header',
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.scss']
})
export class DashboardHeaderComponent {

  isSticky: boolean = false;
  @HostListener('window:scroll', ['$event'])
  checkScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (scrollPosition >= 50) {
      this.isSticky = true;
    } else {
      this.isSticky = false;
    }
  }

  isToggled = false;

  constructor(
    private toggleService: ToggleService,
    private accountService: AccountService
  ) {
    this.toggleService.isToggled$.subscribe(isToggled => {
      this.isToggled = isToggled;
    });
  }

  logout() {
    this.accountService.logout();
  }
}
