import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegraTestPanelComponent } from './integra-test-panel.component';

describe('IntegraTestPanelComponent', () => {
  let component: IntegraTestPanelComponent;
  let fixture: ComponentFixture<IntegraTestPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IntegraTestPanelComponent]
    });
    fixture = TestBed.createComponent(IntegraTestPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
