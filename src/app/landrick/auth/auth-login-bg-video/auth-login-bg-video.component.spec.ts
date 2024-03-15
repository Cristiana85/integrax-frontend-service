import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthLoginBgVideoComponent } from './auth-login-bg-video.component';

describe('AuthLoginBgVideoComponent', () => {
  let component: AuthLoginBgVideoComponent;
  let fixture: ComponentFixture<AuthLoginBgVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthLoginBgVideoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthLoginBgVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
