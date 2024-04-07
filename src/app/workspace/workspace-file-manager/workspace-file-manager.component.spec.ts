import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceFileManagerComponent } from './workspace-file-manager.component';

describe('WorkspaceFileManagerComponent', () => {
  let component: WorkspaceFileManagerComponent;
  let fixture: ComponentFixture<WorkspaceFileManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkspaceFileManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkspaceFileManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
