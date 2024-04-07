import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToggleService } from './workspace-header/toggle.service';


@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent {
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

