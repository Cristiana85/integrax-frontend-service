import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceFileManagerRenameDialogComponent } from './workspace-file-manager-rename-dialog.component';

describe('WorkspaceFileManagerRenameDialogComponent', () => {
  let component: WorkspaceFileManagerRenameDialogComponent;
  let fixture: ComponentFixture<WorkspaceFileManagerRenameDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkspaceFileManagerRenameDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkspaceFileManagerRenameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
