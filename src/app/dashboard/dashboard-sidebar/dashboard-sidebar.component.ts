import { Component } from '@angular/core';
import { ToggleService } from '../dashboard-header/toggle.service';


@Component({
    selector: 'app-dashboard-sidebar',
    templateUrl: './dashboard-sidebar.component.html',
    styleUrls: ['./dashboard-sidebar.component.scss']
})
export class DashboardSidebarComponent {

    panelOpenState = false;

    isToggled = false;

    constructor(
        private toggleService: ToggleService,
    ) {
        this.toggleService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    toggle() {
        this.toggleService.toggle();
    }
}
