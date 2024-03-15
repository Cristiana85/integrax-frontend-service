import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentSidebarComponent } from './component-sidebar.component';

describe('ComponentSidebarComponent', () => {
  let component: ComponentSidebarComponent;
  let fixture: ComponentFixture<ComponentSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponentSidebarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
