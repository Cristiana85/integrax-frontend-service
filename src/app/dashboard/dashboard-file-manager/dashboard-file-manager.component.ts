import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Project } from 'src/app/models/project';
import { DashboardFileManagerRenameDialogComponent } from './dashboard-file-manager-dialog/dashboard-file-manager-rename-dialog/dashboard-file-manager-rename-dialog.component';
import { ProjectsService } from 'src/app/services/projects.service';
import { AccountService } from 'src/app/services/account.service';
import { DashboardFileManagerCreateProjectDialogComponent } from './dashboard-file-manager-dialog/dashboard-file-manager-create-project-dialog/dashboard-file-manager-create-project-dialog.component';
import { HandleUtils } from 'src/app/utils/utils';

@Component({
  selector: 'app-dashboard-file-manager',
  templateUrl: './dashboard-file-manager.component.html',
  styleUrls: ['./dashboard-file-manager.component.scss']
})
export class DashboardFileManagerComponent implements OnInit {

  lProject: Project[] = [];
  selectedProject: Project;

  token: any

  constructor(
    protected dialog: MatDialog,
    protected accountService: AccountService,
    protected projectService: ProjectsService,
    public dialogRenameProjectRef: MatDialogRef<DashboardFileManagerRenameDialogComponent>,
    public dialogCreateProjectRef: MatDialogRef<DashboardFileManagerCreateProjectDialogComponent>
  ) { }

  ngOnInit(): void {
    const user = this.accountService.userValue;
    this.token = user.token;

    this.load();
  }

  load() {
    this.getlProject();
  }

  getlProject() {
    this.projectService
      .getlProject(HandleUtils.getHandle(this.accountService.userValue))
      .subscribe((result) => {
        if (result.successful) {
          this.lProject = result.content;
        } else {
          //this.growlService.showErrorMessage(result.message);
        }
      });
  }


  openCreateFolderDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(CreateFolderDialogBox, {
      width: '510px',
      enterAnimationDuration,
      exitAnimationDuration
    });
  }

  openCreateDocumentDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(CreateDocumentDialogBox, {
      width: '510px',
      enterAnimationDuration,
      exitAnimationDuration
    });
  }

  openCreateProjectDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(CreateProjectDialogBox, {
      width: '510px',
      enterAnimationDuration,
      exitAnimationDuration
    });
  }

  saveProject(project: Project) {
    this.projectService
      .addProject(HandleUtils.getHandle(this.accountService.userValue), project)
      .subscribe((result) => {

        if (result.successful) {
          //this.growlService.showSuccessMessage('message.customization.added');
          this.load();
        } else {
          if (result.mMessage['ERROR']) {
            /*this.growlService.showMessageAsList(
              '',
              result.mMessage['ERROR'],
              'error',
              'message.error'
            );
          } else {
            this.growlService.showErrorMessage(result.message);
          }*/
          }
        }
      });
  }


  deletelProject(project: Project) {
    this.projectService
      .deletelProject(HandleUtils.getHandle(this.accountService.userValue), [project])
      .subscribe((result) => {
        if (result.successful) {
          /*this.growlService.showSuccessMessage(
            'message.customizations.deleted'
          );*/
        } else {
          //this.growlService.showErrorMessage(result.message);
        }
        /*this.displayDeleteConfirm = false;
        this.lSelectedCustomization = [];
        this.customizationsTable.reset();
        this.deleteButton.disable();
        this.editButton.disable();*/
        this.load();
      });
  }

  showRenameDialog(selectedProject: Project) {
    this.dialogRenameProjectRef = this.dialog.open(DashboardFileManagerRenameDialogComponent, {
      width: '510px',
      data: { 'selectedProject': selectedProject, 'lProject': this.lProject }
    });

    const onSave = this.dialogRenameProjectRef.componentInstance.onSave.subscribe((ret) => {
      this.saveProject(ret.data.selectedProject);
    });

    const onHide = this.dialogRenameProjectRef.componentInstance.onHide.subscribe(() => {
      this.dialogRenameProjectRef.close();
    });
    this.dialogRenameProjectRef.afterClosed().subscribe(() => {
      //this.projectService.saveProject();
    });
  }

  showCreateProjectDialog() {
    this.dialogCreateProjectRef = this.dialog.open(DashboardFileManagerCreateProjectDialogComponent, {
      width: '510px',
      data: { 'newProject': new Project(), 'lProject': this.lProject  }
    });

    const onAddProject = this.dialogCreateProjectRef.componentInstance.onAddProject.subscribe((ret) => {
      this.saveProject(ret.data.newProject);
    });

    const onHide = this.dialogCreateProjectRef.componentInstance.onHide.subscribe(() => {
      this.dialogCreateProjectRef.close();
    });
    this.dialogCreateProjectRef.afterClosed().subscribe(() => {
      //this.projectService.saveProject();
    });
  }
}

/*@Component({
  selector: 'rename-project-dialog-box',
  templateUrl: './rename-project-dialog-box.html',
})
export class RenameProjectDialogBox {

  @Output() changed = new EventEmitter<string>()
  selectedProject: Project;

  constructor(
    public dialogRef: MatDialogRef<RenameProjectDialogBox>
  ) { }

  onRenameProject(projectNewName: string){
    this.selectedProject.name = projectNewName;
    this.changed.emit(this.selectedProject.name);
    //this.close();
  }

  close() {
    this.dialogRef.close(true);
  }
}*/

@Component({
  selector: 'create-folder-dialog-box',
  templateUrl: './create-folder-dialog-box.html',
})
export class CreateFolderDialogBox {

  constructor(
    public dialogRef: MatDialogRef<CreateFolderDialogBox>
  ) { }

  close() {
    this.dialogRef.close(true);
  }
}

@Component({
  selector: 'create-document-dialog-box',
  templateUrl: './create-document-dialog-box.html',
})
export class CreateDocumentDialogBox {

  constructor(
    public dialogRef: MatDialogRef<CreateDocumentDialogBox>
  ) { }

  close() {
    this.dialogRef.close(true);
  }

}


@Component({
  selector: 'create-project-dialog-box',
  templateUrl: './create-project-dialog-box.html',
})
export class CreateProjectDialogBox {

  constructor(
    public dialogRef: MatDialogRef<CreateProjectDialogBox>
  ) { }

  onSubmit(){
    console.log("ciao")
  }

  close() {
    this.dialogRef.close(true);
  }
}
