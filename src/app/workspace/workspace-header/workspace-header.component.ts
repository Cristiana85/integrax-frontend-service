import { Component, HostListener } from '@angular/core';
import { ToggleService } from './toggle.service';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-workspace-header',
  templateUrl: './workspace-header.component.html',
  styleUrls: ['./workspace-header.component.scss']
})
export class WorkspaceHeaderComponent {

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
