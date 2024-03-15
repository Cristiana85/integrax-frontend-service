import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardFileManagerCreateProjectDialogComponent } from './dashboard-file-manager-create-project-dialog.component';

describe('DashboardFileManagerCreateProjectDialogComponent', () => {
  let component: DashboardFileManagerCreateProjectDialogComponent;
  let fixture: ComponentFixture<DashboardFileManagerCreateProjectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardFileManagerCreateProjectDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardFileManagerCreateProjectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
