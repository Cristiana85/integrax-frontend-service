import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthBsResetComponent } from './auth-bs-reset.component';

describe('AuthBsResetComponent', () => {
  let component: AuthBsResetComponent;
  let fixture: ComponentFixture<AuthBsResetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthBsResetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthBsResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
