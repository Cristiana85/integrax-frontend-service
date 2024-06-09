import { Component } from '@angular/core';
import { ToggleService } from '../workspace-header/toggle.service';
import * as _ from 'lodash';
import * as joint from 'jointjs';
import * as jQuery from 'jquery';
import * as $ from 'backbone';

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

        const link = new joint.dia.Link();
        console.log(link);
    }

    toggle() {
        this.toggleService.toggle();
    }
}
