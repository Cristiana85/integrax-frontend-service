import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthBsSignupComponent } from './auth-bs-signup.component';

describe('AuthBsSignupComponent', () => {
  let component: AuthBsSignupComponent;
  let fixture: ComponentFixture<AuthBsSignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthBsSignupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthBsSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
