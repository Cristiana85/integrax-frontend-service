import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegraWorkspaceComponent } from './integra-workspace.component';

describe('IntegraWorkspaceComponent', () => {
  let component: IntegraWorkspaceComponent;
  let fixture: ComponentFixture<IntegraWorkspaceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IntegraWorkspaceComponent]
    });
    fixture = TestBed.createComponent(IntegraWorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
