import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkspaceFileManagerComponent } from './workspace-file-manager/workspace-file-manager.component';
import { WorkspaceComponent } from './workspace.component';
import { TeamSpaceComponent } from './team-space/team-space.component';
import { MySpaceComponent } from './my-space/my-space.component';

const routes: Routes = [
  {
    path: '', component: WorkspaceComponent,
    children: [
      { path: 'workspace-file-manager', component: WorkspaceFileManagerComponent },
      { path: 'team-space', component: TeamSpaceComponent },
      { path: 'my-space', component: MySpaceComponent },
    ]
  },
  { path: 'workspace-file-manager', component: WorkspaceFileManagerComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkspaceRoutingModule { }
