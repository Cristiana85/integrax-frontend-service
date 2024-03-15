import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorporatePricingComponent } from './corporate-pricing.component';

describe('CorporatePricingComponent', () => {
  let component: CorporatePricingComponent;
  let fixture: ComponentFixture<CorporatePricingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorporatePricingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorporatePricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
