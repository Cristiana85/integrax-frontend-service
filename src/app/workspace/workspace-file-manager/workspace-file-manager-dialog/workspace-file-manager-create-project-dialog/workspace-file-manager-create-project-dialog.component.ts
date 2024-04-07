import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Project } from 'src/app/models/project';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-workspace-file-manager-create-project-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule],
  templateUrl: './workspace-file-manager-create-project-dialog.component.html',
  styleUrl: './workspace-file-manager-create-project-dialog.component.scss'
})
export class WorkspaceFileManagerCreateProjectDialogComponent {
  @Output() onHide: EventEmitter<any> = new EventEmitter();
  @Output() onAddProject: EventEmitter<any> = new EventEmitter();

  newProjectName: String;
  lProject: Project[];

  constructor(@Inject(MAT_DIALOG_DATA) public matData: { newProject: Project, lProject: Project[] },
    private accountService : AccountService) {
    this.newProjectName = matData.newProject.name;
    this.lProject = matData.lProject;
  }

  ngOnInit() {
  }

  hide() {
    this.onHide.emit();
  }

  addProject() {
    if (this.lProject.length > 0 && this.lProject.filter(p => p.name === this.newProjectName).length > 0){
      //errore
    } else {
      this.matData.newProject.accountId = this.accountService.userValue.id;
      this.matData.newProject.name = this.newProjectName;
      this.hide();
      this.onAddProject.emit({ data: this.matData });
    }
  }
}
