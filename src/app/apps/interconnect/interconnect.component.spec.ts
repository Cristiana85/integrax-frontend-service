import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterconnectComponent } from './interconnect.component';

describe('InterconnectComponent', () => {
  let component: InterconnectComponent;
  let fixture: ComponentFixture<InterconnectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InterconnectComponent]
    });
    fixture = TestBed.createComponent(InterconnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
