import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthBsLoginComponent } from './auth-bs-login.component';

describe('AuthBsLoginComponent', () => {
  let component: AuthBsLoginComponent;
  let fixture: ComponentFixture<AuthBsLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthBsLoginComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthBsLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
