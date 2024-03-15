import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardFileManagerComponent } from './dashboard-file-manager/dashboard-file-manager.component';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
  {
    path: '', component: DashboardComponent,
    children: [
      { path: 'dashboard-file-manager', component: DashboardFileManagerComponent }
    ]
  },
  { path: 'dashboard-file-manager', component: DashboardFileManagerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
