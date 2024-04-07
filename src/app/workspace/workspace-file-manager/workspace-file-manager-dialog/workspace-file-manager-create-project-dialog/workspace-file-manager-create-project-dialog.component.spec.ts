import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceFileManagerCreateProjectDialogComponent } from './workspace-file-manager-create-project-dialog.component';

describe('WorkspaceFileManagerCreateProjectDialogComponent', () => {
  let component: WorkspaceFileManagerCreateProjectDialogComponent;
  let fixture: ComponentFixture<WorkspaceFileManagerCreateProjectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkspaceFileManagerCreateProjectDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkspaceFileManagerCreateProjectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
