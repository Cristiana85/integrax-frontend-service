import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardFileManagerRenameDialogComponent } from './dashboard-file-manager-rename-dialog.component';

describe('DashboardFileManagerRenameDialogComponent', () => {
  let component: DashboardFileManagerRenameDialogComponent;
  let fixture: ComponentFixture<DashboardFileManagerRenameDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardFileManagerRenameDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardFileManagerRenameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
