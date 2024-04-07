import { Component } from '@angular/core';
import { ToggleService } from '../workspace-header/toggle.service';


@Component({
    selector: 'app-workspace-sidebar',
    templateUrl: './workspace-sidebar.component.html',
    styleUrls: ['./workspace-sidebar.component.scss']
})
export class WorkspaceSidebarComponent {

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
