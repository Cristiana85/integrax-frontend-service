import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Project } from 'src/app/models/project';

@Component({
  selector: 'app-workspace-file-manager-rename-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule],
  templateUrl: './workspace-file-manager-rename-dialog.component.html',
  styleUrl: './workspace-file-manager-rename-dialog.component.scss'
})
export class WorkspaceFileManagerRenameDialogComponent {
  @Output() onHide: EventEmitter<any> = new EventEmitter();
  @Output() onSave: EventEmitter<any> = new EventEmitter();

  projectNewName: String;

  constructor(@Inject(MAT_DIALOG_DATA) public matData: { selectedProject: Project, lProject: Project[] }) {
    this.projectNewName = matData.selectedProject.name;
  }

  ngOnInit() {
    console.log(this.matData);
  }

  hide() {
    this.onHide.emit();
  }

  save() {
    //check if the new name exist
    if (true) {
      this.matData.selectedProject.name = this.projectNewName;
      this.hide();
      this.onSave.emit({ data: this.matData });
    }
  }
}
