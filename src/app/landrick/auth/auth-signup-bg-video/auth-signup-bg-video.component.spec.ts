import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthSignupBgVideoComponent } from './auth-signup-bg-video.component';

describe('AuthSignupBgVideoComponent', () => {
  let component: AuthSignupBgVideoComponent;
  let fixture: ComponentFixture<AuthSignupBgVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthSignupBgVideoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthSignupBgVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
