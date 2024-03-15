import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardFileManagerComponent } from './dashboard-file-manager.component';

describe('DashboardFileManagerComponent', () => {
  let component: DashboardFileManagerComponent;
  let fixture: ComponentFixture<DashboardFileManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardFileManagerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardFileManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
