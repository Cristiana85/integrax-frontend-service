import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChPasswordComponent } from './ch-password.component';

describe('ChPasswordComponent', () => {
  let component: ChPasswordComponent;
  let fixture: ComponentFixture<ChPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChPasswordComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
