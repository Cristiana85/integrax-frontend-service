import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthResetPasswordBgVideoComponent } from './auth-reset-password-bg-video.component';

describe('AuthResetPasswordBgVideoComponent', () => {
  let component: AuthResetPasswordBgVideoComponent;
  let fixture: ComponentFixture<AuthResetPasswordBgVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthResetPasswordBgVideoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthResetPasswordBgVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
